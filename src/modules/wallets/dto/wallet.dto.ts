import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WalleteDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  amount: number;
}
