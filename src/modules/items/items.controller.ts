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
import { Items } from 'src/entities/items.entity';
import { AuthGuard } from '@nestjs/passport';
import { ResponseData } from 'src/common/http-success.response';
import { CreateItemDto } from './dto/items.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(): Promise<Items[]> {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: number): Promise<ResponseData> {
    return this.itemsService.findOne(req.user.data.id, id);
  }

  @Post()
  create(@Req() req, @Body() itemData: CreateItemDto): Promise<ResponseData> {
    const data = {
      ...itemData,
      userId: req.user.data.id,
    };
    return this.itemsService.create(data);
  }

  @Patch(':id/publish')
  publish(@Req() req, @Param('id') id: number): Promise<ResponseData> {
    return this.itemsService.publish(req.user.data.id, id);
  }
}
