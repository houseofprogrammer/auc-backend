import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from 'src/modules/items/items.entity';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Users } from 'src/modules/users/users.entity';
import { BullModule } from '@nestjs/bull';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Items, Users]),
    BullModule.registerQueue({
      name: 'auctions',
    }),
    WalletsModule,
  ],
  providers: [ItemsService, Logger],
  controllers: [ItemsController],
  exports: [ItemsService],
})
export class ItemsModule {}
