import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './Services/Query/user';
import {UserDto, LoginDto, CheckEmailDto} from './Dto/userDto';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /user/register
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: UserDto) {
    const ok = await this.userService.registerUser(dto);
    if (!ok) throw new ConflictException('Email already registered');
    return { message: 'User registered successfully' };
  }

  // POST /user/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const valid = await this.userService.findUser(dto.email, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    return { message: 'Login successful' };
  }

  // GET /user/check-email?email=...
  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Query('email') email: string) {
    const exists = await this.userService.checkEmailExists(email);
    return { exists };
  }
}
