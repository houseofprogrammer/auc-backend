import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from 'src/entities/items.entity';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Users } from 'src/entities/users.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Items, Users])],
  providers: [ItemsService, Logger],
  controllers: [ItemsController],
  exports: [ItemsService],
})
export class ItemsModule {}
