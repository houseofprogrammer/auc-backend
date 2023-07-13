import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Items } from 'src/modules/items/items.entity';
import { AuthGuard } from '@nestjs/passport';
import { ResponseData } from 'src/commons/http-success.response';
import { CreateItemDto } from './dto/items.dto';
import { ApiBody } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(@Req() req): Promise<ResponseData> {
    return this.itemsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: number): Promise<ResponseData> {
    return this.itemsService.findOne(req.user.id, id);
  }

  @Get('/status/:status')
  getItemsByStatus(
    @Param('status') status: 'published' | 'completed',
  ): Promise<ResponseData> {
    return this.itemsService.getItemByStatus(status);
  }

  @ApiBody({ type: CreateItemDto })
  @Post()
  create(@Req() req, @Body() itemData: CreateItemDto): Promise<ResponseData> {
    const data = {
      ...itemData,
      userId: req.user.id,
    };
    return this.itemsService.create(data);
  }

  @Patch(':id/publish')
  publish(@Req() req, @Param('id') id: number): Promise<ResponseData> {
    return this.itemsService.publish(req.user.id, id);
  }
}
