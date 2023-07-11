import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';

// create-bid.dto.ts
export class CreateBidDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  itemId: number;
}

export class UpdateBidDto extends PartialType(CreateBidDto) {}
