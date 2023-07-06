import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [UsersService, Logger],
  controllers: [UsersController],
})
export class UsersModule {}
