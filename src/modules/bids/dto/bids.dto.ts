import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  itemId: number;
}

export class UpdateBidDto extends PartialType(CreateBidDto) {}
