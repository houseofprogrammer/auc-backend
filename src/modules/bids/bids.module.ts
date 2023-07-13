import { Logger, Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { Bids } from 'src/modules/bids/bids.entity';
import { Items } from 'src/modules/items/items.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { Wallets } from 'src/modules/wallets/wallets.entity';
import { RedisStore } from 'src/storages/redis-store';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Items, Bids, Wallets])],
  providers: [BidsService, Logger, RedisStore, ConfigService],
  controllers: [BidsController],
  exports: [BidsService],
})
export class BidsModule {}
