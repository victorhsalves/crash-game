import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class PlaceBetDto {
  @IsInt()
  @Min(100)
  public amountCents!: number;

  @IsOptional()
  @IsString()
  public socketId?: string;
}
