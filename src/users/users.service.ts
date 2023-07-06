import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { GenericSuccessResponse } from 'src/common/http-success.response';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private userRepo: Repository<Users>) {}

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return GenericSuccessResponse(result, HttpStatus.OK);
  }

  async findOneWithUserName(email: string) {
    return await this.userRepo.findOne({ where: { email: email } });
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const user = await this.userRepo.create(createUserDto);
      await this.userRepo.save(user);

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value')
      ) {
        throw new ConflictException('Duplicate data');
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }
}
