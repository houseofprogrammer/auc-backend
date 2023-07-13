import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from 'src/modules/users/users.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { Wallets } from 'src/modules/wallets/wallets.entity';

@Module({
  imports: [WalletsModule, TypeOrmModule.forFeature([Users, Wallets])],
  providers: [UsersService, Logger],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
