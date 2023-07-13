import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GenericSuccessResponse,
  ResponseData,
} from 'src/common/http-success.response';
import { Items } from 'src/entities/items.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateItemDto } from './dto/items.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Items)
    private itemsRepository: Repository<Items>,

    private readonly logger: Logger,

    private walletsService: WalletsService,

    @InjectQueue('auctions')
    private auctionQueue: Queue,
  ) {}

  findAll(): Promise<Items[]> {
    return this.itemsRepository.find();
  }

  async findOne(userId: number, id: number): Promise<ResponseData> {
    const item = await this.itemsRepository.findOne({
      where: { userId: userId, id: id },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return GenericSuccessResponse(item, HttpStatus.OK);
  }

  async create(data: CreateItemDto): Promise<ResponseData> {
    try {
      const timeWindowInMills = new Date(
        Date.now() + data.timeWindow * 60 * 60 * 1000,
      );
      const newItem = this.itemsRepository.create({
        ...data,
        status: 'draft',
        endBidtime: timeWindowInMills,
      });
      await this.itemsRepository.save(newItem);

      const delay = newItem.timeWindow * 60 * 60 * 1000;
      await this.auctionQueue.add({ itemId: newItem.id }, { delay: delay });

      return GenericSuccessResponse(newItem, HttpStatus.CREATED);
    } catch (error) {
      if (error.message.includes('violates not-null constraint')) {
        this.logger.error(
          `Bad request data with error: ${error.message}`,
          ItemsService.name,
        );
        throw new BadRequestException('Bad request');
      } else {
        this.logger.error(
          `Something wrong: ${error.message}`,
          ItemsService.name,
        );
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  async publish(userId: number, id: number): Promise<ResponseData> {
    const item = await this.itemsRepository.findOne({ where: { id: id } });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.userId != userId) {
      throw new UnauthorizedException();
    }

    if (item.status !== 'draft') {
      throw new BadRequestException('Only draft items can be published');
    }

    item.status = 'published';

    try {
      await this.itemsRepository.save(item);
      return GenericSuccessResponse(item, HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Something wrong: ${error.message}`, ItemsService.name);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getItemByStatus(
    status: 'published' | 'completed',
  ): Promise<ResponseData> {
    try {
      const items = await this.itemsRepository.find({ where: { status } });
      if (!items.length) {
        throw new NotFoundException('Item not found');
      }

      return GenericSuccessResponse(items, HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Something wrong: ${error.message}`, ItemsService.name);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  async endAuction(itemId: number) {
    const item = await this.itemsRepository.findOne({
      where: {
        status: 'published',
        id: itemId,
      },
      relations: ['bids'],
    });
    this.logger.log(
      `[endAuction] getting the published item ${itemId}:${item.name}`,
    );

    const queryRunner =
      this.itemsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const highestBid = this.getHighestBid(item.bids);

      if (highestBid) {
        item.status = 'completed';
        item.winnerUserId = highestBid.userId;
        await queryRunner.manager.save(item);

        await this.refundLosingBids(item, highestBid, queryRunner.manager);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to end auction for item ${item.id}: ${error}`);
    } finally {
      await queryRunner.release();
    }
  }

  private getHighestBid(bids) {
    return bids.reduce((prev, current) =>
      prev.amount > current.amount ? prev : current,
    );
  }

  private async refundLosingBids(item, highestBid, manager: EntityManager) {
    const accumulateUserBids = item.bids.reduce((prev, current) => {
      prev[current.userId] = (prev[current.userId] || 0) + current.amount;
      return prev;
    }, {});

    for (const userId in accumulateUserBids) {
      if (Number(userId) !== highestBid.userId) {
        await this.walletsService.refundBalance(
          parseInt(userId),
          accumulateUserBids[userId],
          manager,
        );
      }
    }
  }
}
