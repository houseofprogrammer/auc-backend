import { IsNotEmpty, IsNumber } from 'class-validator';

export class WalleteDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
