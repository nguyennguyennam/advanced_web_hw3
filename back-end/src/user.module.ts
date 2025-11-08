import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { UserController } from './app.controller';
import { UserService } from './Services/Query/user';
import { User } from './Model/user';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    CacheModule.register(),           
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // nếu nơi khác cần dùng UserService
})
export class UserModule {}
