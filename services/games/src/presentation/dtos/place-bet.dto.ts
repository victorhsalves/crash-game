import { IsInt, Min } from "class-validator";

export class PlaceBetDto {
  @IsInt()
  @Min(100)
  public amountCents!: number;
}
