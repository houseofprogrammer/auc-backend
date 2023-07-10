import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseData } from 'src/common/http-success.response';
import { WalletsService } from './wallets.service';
import { WalleteDto } from './dto/wallet.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Get('/balance')
  getBalance(@Req() req): Promise<ResponseData> {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('/topup')
  topupWallet(
    @Req() req,
    @Body() walleteDto: WalleteDto,
  ): Promise<ResponseData> {
    return this.walletService.topupWallet(req.user.id, walleteDto.amount);
  }

  @Put('/withdraw')
  withdrawBalance(
    @Req() req,
    @Body() walleteDto: WalleteDto,
  ): Promise<ResponseData> {
    return this.walletService.withdrawBalance(req.user.id, walleteDto.amount);
  }
}
