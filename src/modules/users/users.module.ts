import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from 'src/entities/users.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { Wallets } from 'src/entities/wallets.entity';

@Module({
  imports: [WalletsModule, TypeOrmModule.forFeature([Users, Wallets])],
  providers: [UsersService, Logger],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
