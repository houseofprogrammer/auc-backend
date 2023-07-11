import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bids } from 'src/entities/bids.entity';
import { Repository } from 'typeorm';
import { CreateBidDto, UpdateBidDto } from './dto/bids.dto';
import { Items } from 'src/entities/items.entity';
import {
  GenericSuccessResponse,
  ResponseData,
} from 'src/common/http-success.response';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bids)
    private bidsRepository: Repository<Bids>,

    @InjectRepository(Items)
    private itemsRepository: Repository<Items>,

    private readonly logger: Logger,
  ) {}

  async create(
    userId: number,
    createBidDto: CreateBidDto,
  ): Promise<ResponseData> {
    const item = await this.itemsRepository.findOne({
      where: { id: createBidDto.itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== 'published') {
      throw new BadRequestException(
        'Cannot bid on an item that is not published',
      );
    }

    if (createBidDto.amount <= item.startingPrice) {
      throw new BadRequestException(
        'Bid price must be higher than the starting price',
      );
    }

    const highestBid = await this.bidsRepository
      .createQueryBuilder('bids')
      .select('MAX(bids.amount)', 'maxAmount')
      .where('bids.item_id = :itemId', { itemId: item.id })
      .getRawOne();

    if (highestBid && highestBid.maxAmount >= createBidDto.amount) {
      throw new BadRequestException(
        'Bid amount must be higher than current highest bid',
      );
    }

    const bid = this.bidsRepository.create({
      userId: userId,
      itemId: item.id,
      amount: createBidDto.amount,
    });

    try {
      await this.bidsRepository.save(bid);
      return GenericSuccessResponse(bid, HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Something wrong: ${error.message}`, BidsService.name);
      throw new InternalServerErrorException('Internal server error');
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

  async update(
    userId: number,
    itemId: number,
    updateBidDto: UpdateBidDto,
  ): Promise<ResponseData> {
    const item = await this.itemsRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== 'published') {
      throw new BadRequestException(
        'Cannot update bid on an item that is not published',
      );
    }

    const bid = await this.bidsRepository.findOne({
      where: { userId: userId, itemId: itemId },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (updateBidDto.amount <= item.startingPrice) {
      throw new BadRequestException(
        'Bid price must be higher than the starting price',
      );
    }

    const highestBid = await this.bidsRepository
      .createQueryBuilder('bids')
      .select('MAX(bids.amount)', 'maxAmount')
      .where('bids.item_id = :itemId', { itemId: itemId })
      .getRawOne();

    if (highestBid && highestBid.maxAmount >= updateBidDto.amount) {
      throw new BadRequestException(
        'Bid amount must be higher than current highest bid',
      );
    }

    bid.amount = updateBidDto.amount;

    try {
      await this.bidsRepository.save(bid);
      return GenericSuccessResponse(bid, HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Something wrong: ${error.message}`, BidsService.name);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
