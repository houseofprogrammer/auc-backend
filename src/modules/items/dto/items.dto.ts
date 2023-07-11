import { IsNotEmpty, IsString, IsInt, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  startingPrice: number;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsEnum(['draft', 'published', 'completed'])
  status: 'draft' | 'published' | 'completed';
}
