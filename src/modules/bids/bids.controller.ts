import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBidDto, UpdateBidDto } from './dto/bids.dto';
import { AuthGuard } from '@nestjs/passport';
import { BidsService } from './bids.service';
import { ResponseData } from 'src/common/http-success.response';
import { ApiBody } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @ApiBody({ type: CreateBidDto })
  @Post()
  create(
    @Req() req,
    @Body() createBidDto: CreateBidDto,
  ): Promise<ResponseData> {
    return this.bidsService.create(req.user.id, createBidDto);
  }

  @Get(':itemId/highest')
  getHighestBidForItem(@Param('itemId') itemId: number): Promise<ResponseData> {
    return this.bidsService.getHighestBidForItem(itemId);
  }

  @ApiBody({ type: UpdateBidDto })
  @Put(':itemId/increase-bid')
  async increaseBid(
    @Req() req,
    @Param('itemId') itemId: number,
    @Body() updateBidDto: UpdateBidDto,
  ) {
    return this.bidsService.increaseBid(req.user.id, itemId, updateBidDto);
  }
}
