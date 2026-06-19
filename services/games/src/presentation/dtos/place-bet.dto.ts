import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class PlaceBetDto {
  @ApiProperty({ minimum: 100, example: 500, description: "Valor em centavos (min 1.00)" })
  @IsInt()
  @Min(100)
  public amountCents!: number;

  @ApiPropertyOptional({ description: "Socket.IO client id para notificação direcionada" })
  @IsOptional()
  @IsString()
  public socketId?: string;
}
