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
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/items.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Items)
    private itemsRepository: Repository<Items>,

    @InjectRepository(Users)
    private userRepository: Repository<Users>,

    private readonly logger: Logger,
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
      const newItem = this.itemsRepository.create({
        ...data,
        status: 'draft',
      });
      await this.itemsRepository.save(newItem);
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
}
