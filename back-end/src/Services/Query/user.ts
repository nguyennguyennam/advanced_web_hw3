import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { User } from 'src/Model/user';
import { UserDto } from 'src/Dto/userDto';
import { hashPassword, comparePassword } from './Hashing';

const USER_TTL = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  private userKey(email: string): string {
    return `user:${email}`;
  }

  private async getUserByEmailCached(email: string): Promise<User | null> {
    const key = this.userKey(email);
    const cached = await this.cache.get<User>(key);
    if (cached) return cached;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) await this.cache.set(key, user, USER_TTL);
    return user;
  }

  async registerUser(userDTO: UserDto): Promise<boolean> {
    const existed = await this.getUserByEmailCached(userDTO.email);
    if (existed) throw new ConflictException('Email already registered');

    const hashedPassword = await hashPassword(userDTO.password);
    const newUser = this.userRepository.create({
      username: userDTO.username,
      email: userDTO.email,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(newUser);
    await this.cache.set(this.userKey(userDTO.email), saved, USER_TTL);
    return !!saved;
  }

  async findUser(email: string, password: string): Promise<boolean> {
    const user = await this.getUserByEmailCached(email);
    if (!user) return false;
    return comparePassword(password, user.password);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.getUserByEmailCached(email);
    return !!user;
  }

  async invalidateUserCache(email: string): Promise<void> {
    await this.cache.del(this.userKey(email));
  }
}
