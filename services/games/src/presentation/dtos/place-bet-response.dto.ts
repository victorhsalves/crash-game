import { BetStatus } from "../../domain/enums/bet-status.enum";

export class PlaceBetResponseDto {
  betId!: string;
  status!: BetStatus;

  public static create(betId: string): PlaceBetResponseDto {
    const dto = new PlaceBetResponseDto();
    dto.betId = betId;
    dto.status = BetStatus.Pending;
    return dto;
  }
}
