import { ApiProperty } from "@nestjs/swagger";
import { BetStatus } from "../../domain/enums/bet-status.enum";

export class PlaceBetResponseDto {
  @ApiProperty({ format: "uuid" })
  betId!: string;

  @ApiProperty({ enum: BetStatus, enumName: "BetStatus", example: BetStatus.Pending })
  status!: BetStatus;

  public static create(betId: string): PlaceBetResponseDto {
    const dto = new PlaceBetResponseDto();
    dto.betId = betId;
    dto.status = BetStatus.Pending;
    return dto;
  }
}
