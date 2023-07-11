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
import { Wallets } from 'src/entities/wallets.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallets)
    private walletRepository: Repository<Wallets>,
    private readonly logger: Logger,
  ) {}

  async getBalance(userId: number): Promise<ResponseData> {
    const wallet = await this.walletRepository.findOne({
      where: { userId: userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.userId != userId) {
      throw new UnauthorizedException();
    }

    return GenericSuccessResponse({ balance: wallet.balance }, HttpStatus.OK);
  }

  async topupWallet(userId: number, amount: number): Promise<ResponseData> {
    const wallet = await this.walletRepository.findOne({
      where: { userId: userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.userId != userId) {
      throw new UnauthorizedException();
    }

    wallet.balance += amount;
    try {
      await this.walletRepository.save(wallet);
      return GenericSuccessResponse(wallet, HttpStatus.OK);
    } catch (error) {
      this.logger.error(
        `Something wrong: ${error.message}`,
        WalletsService.name,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async withdrawBalance(userId: number, amount: number): Promise<ResponseData> {
    const wallet = await this.walletRepository.findOne({
      where: { userId: userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.userId != userId) {
      throw new UnauthorizedException();
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balance -= amount;

    try {
      await this.walletRepository.save(wallet);
      return GenericSuccessResponse(wallet, HttpStatus.OK);
    } catch (error) {
      this.logger.error(
        `Something wrong: ${error.message}`,
        WalletsService.name,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async create(userId: number, manager: EntityManager): Promise<Wallets> {
    const newWallet = this.walletRepository.create({
      userId: userId,
      balance: 0,
    });

    try {
      return manager.save(newWallet);
    } catch (error) {
      this.logger.error(
        `Something wrong: ${error.message}`,
        WalletsService.name,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
