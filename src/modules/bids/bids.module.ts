import { Logger, Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { Bids } from 'src/entities/bids.entity';
import { Items } from 'src/entities/items.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { Wallets } from 'src/entities/wallets.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Items, Bids, Wallets])],
  providers: [BidsService, Logger],
  controllers: [BidsController],
  exports: [BidsService],
})
export class BidsModule {}
