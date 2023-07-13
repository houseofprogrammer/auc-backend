import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bids } from 'src/modules/bids/bids.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBidDto, UpdateBidDto } from './dto/bids.dto';
import { Items } from 'src/modules/items/items.entity';
import {
  GenericSuccessResponse,
  ResponseData,
} from 'src/commons/http-success.response';
import { Wallets } from 'src/modules/wallets/wallets.entity';
import { RedisStore } from 'src/storages/redis-store';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bids)
    private bidsRepository: Repository<Bids>,

    @InjectRepository(Items)
    private itemsRepository: Repository<Items>,

    @InjectRepository(Wallets)
    private walletsRepository: Repository<Wallets>,

    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly redisStore: RedisStore,
    private readonly configService: ConfigService,
  ) {}

  async create(
    userId: number,
    createBidDto: CreateBidDto,
  ): Promise<ResponseData> {
    const item = await this.validateItem(
      createBidDto.itemId,
      createBidDto.amount,
    );
    const lastBidTime = await this.getLastBidTime(userId);
    const now = Date.now();
    const minBidTime = this.configService.get<number>('MINIMUM_BID_TIME', 5000);

    if (lastBidTime && now - lastBidTime < minBidTime) {
      throw new BadRequestException(
        'Please wait a moment before bidding again',
      );
    }

    const userWallet = await this.validateWallet(userId, createBidDto.amount);

    await this.validateHighestBid(createBidDto.itemId, createBidDto.amount);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const bid = this.bidsRepository.create({
      userId: userId,
      itemId: item.id,
      amount: createBidDto.amount,
    });

    try {
      await queryRunner.manager.save(bid);

      userWallet.balance -= createBidDto.amount;
      await queryRunner.manager.save(userWallet);
      await queryRunner.commitTransaction();

      await this.setLastBidTime(userId, now);

      return GenericSuccessResponse(bid, HttpStatus.OK);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Something wrong: ${error.message}`, BidsService.name);
      throw new InternalServerErrorException('Internal server error');
    } finally {
      await queryRunner.release();
    }
  }

  async getHighestBidForItem(itemId: number): Promise<ResponseData> {
    try {
      const highestBid = await this.bidsRepository
        .createQueryBuilder('bids')
        .select('MAX(bids.amount)', 'max')
        .where('bids.item_id = :itemId', { itemId: itemId })
        .getRawOne();

      if (!highestBid) {
        throw new NotFoundException('No bids found for this item');
      }

      return GenericSuccessResponse(highestBid, HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Something wrong: ${error.message}`, BidsService.name);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async increaseBid(
    userId: number,
    itemId: number,
    updateBidDto: UpdateBidDto,
  ): Promise<ResponseData> {
    const lastBidTime = await this.getLastBidTime(userId);
    const now = Date.now();
    const minBidTime = this.configService.get<number>('MINIMUM_BID_TIME', 5000);

    if (lastBidTime && now - lastBidTime < minBidTime) {
      throw new BadRequestException(
        'Please wait a moment before bidding again',
      );
    }

    await this.validateItem(itemId, updateBidDto.amount);
    const userWallet = await this.validateWallet(userId, updateBidDto.amount);

    const bid = await this.bidsRepository.findOne({
      where: { userId: userId, itemId: itemId },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }
    bid.amount = updateBidDto.amount;

    await this.validateHighestBid(itemId, updateBidDto.amount);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(bid);

      userWallet.balance -= updateBidDto.amount;
      await queryRunner.manager.save(userWallet);
      await queryRunner.commitTransaction();

      return GenericSuccessResponse(bid, HttpStatus.OK);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Something wrong: ${error.message}`, BidsService.name);
      throw new InternalServerErrorException('Internal server error');
    } finally {
      await queryRunner.release();
    }
  }

  private async validateItem(itemId: number, amount: number): Promise<Items> {
    const item = await this.itemsRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== 'published') {
      throw new BadRequestException(
        'Cannot bid on an item that is not published',
      );
    }

    if (amount <= item.startingPrice) {
      throw new BadRequestException(
        'Bid price must be higher than the starting price',
      );
    }

    return item;
  }

  private async validateWallet(
    userId: number,
    amount: number,
  ): Promise<Wallets> {
    const userWallet = await this.walletsRepository.findOne({
      where: { userId: userId },
    });

    if (!userWallet) {
      throw new NotFoundException('User not found');
    }

    if (userWallet.balance < amount) {
      throw new BadRequestException('Insufficient balance, please deposit');
    }

    return userWallet;
  }

  private async validateHighestBid(
    itemId: number,
    amount: number,
  ): Promise<void> {
    const highestBid = await this.bidsRepository
      .createQueryBuilder('bids')
      .select('MAX(bids.amount)', 'maxAmount')
      .where('bids.item_id = :itemId', { itemId: itemId })
      .getRawOne();

    if (highestBid && highestBid.maxAmount >= amount) {
      throw new BadRequestException(
        'Bid amount must be higher than current highest bid',
      );
    }
  }

  private async setLastBidTime(userId: number, time: number): Promise<void> {
    await this.redisStore
      .getClient()
      .set(`lastBidTime:${userId}`, time.toString());
  }

  async getLastBidTime(userId: number): Promise<number | null> {
    const lastBidTime = await this.redisStore
      .getClient()
      .get(`lastBidTime:${userId}`);
    return lastBidTime ? parseInt(lastBidTime) : null;
  }
}
