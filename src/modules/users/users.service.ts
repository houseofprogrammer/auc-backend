import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import {
  GenericSuccessResponse,
  ResponseData,
} from 'src/common/http-success.response';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private userRepo: Repository<Users>,
    private readonly logger: Logger,
    private readonly walletsService: WalletsService,
    private dataSource: DataSource,
  ) {}

  async findOne(id: number): Promise<ResponseData> {
    const user = await this.userRepo.findOne({ where: { id: id } });
    if (!user) {
      this.logger.error(`User with id: ${id} is not found`, UsersService.name);
      throw new NotFoundException('User not found');
    }

    return GenericSuccessResponse(user, HttpStatus.OK);
  }

  async findOneWithUserName(email: string) {
    return await this.userRepo.findOne({
      select: ['id', 'email', 'password'],
      where: { email: email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<ResponseData> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = this.userRepo.create(createUserDto);
      await this.userRepo.save(user);
      await this.walletsService.create(user.id, queryRunner.manager);

      await queryRunner.commitTransaction();
      return GenericSuccessResponse(user, HttpStatus.CREATED);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value')
      ) {
        this.logger.error(
          `Duplicate error data with email ${createUserDto.email} and error: ${error.message}`,
          UsersService.name,
        );
        throw new ConflictException('Duplicate data');
      } else {
        this.logger.error(
          `Something wrong: ${error.message}`,
          UsersService.name,
        );
        throw new InternalServerErrorException('Internal server error');
      }
    } finally {
      await queryRunner.release();
    }
  }
}
