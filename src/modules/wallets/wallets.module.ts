import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallets } from 'src/entities/wallets.entity';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallets])],
  providers: [WalletsService, Logger],
  controllers: [WalletsController],
  exports: [WalletsService],
})
export class WalletsModule {}
