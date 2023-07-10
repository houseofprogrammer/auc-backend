import { IsNotEmpty, IsString, IsInt, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  startingPrice: number;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsEnum(['draft', 'published', 'completed'])
  status: 'draft' | 'published' | 'completed';
}
