import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ItemsService } from './items.service';
import { Logger } from '@nestjs/common';

@Processor('auctions')
export class AuctionsConsumer {
  private readonly logger = new Logger(AuctionsConsumer.name);
  constructor(private itemsService: ItemsService) {}

  @Process()
  async handleAuctionEnd(job: Job<{ itemId: number }>) {
    const { itemId } = job.data;
    this.logger.log(`Processing auction end for item ${itemId}`);
    await this.itemsService.endAuction(itemId);
    this.logger.log(`Processed auction end for item ${itemId}`);
  }
}
