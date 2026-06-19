import type { Bet } from "../../domain/entities/bet.entity";
import { BetStatus } from "../../domain/enums/bet-status.enum";
import { RoundStatus } from "../../domain/enums/round-status.enum";

export type RoundBetPublicStatus = "ACCEPTED" | "CASHED_OUT" | "LOST";

export class RoundBetPublicDto {
  public id!: string;
  public username!: string;
  public amountCents!: number;
  public status!: RoundBetPublicStatus;
  public multiplier!: string | null;
  public payoutCents!: number | null;
  public cashedOutAt!: string | null;

  public static fromDomain(bet: Bet, roundStatus: RoundStatus): RoundBetPublicDto | null {
    if (!RoundBetPublicDto.shouldInclude(bet, roundStatus)) {
      return null;
    }

    const dto = new RoundBetPublicDto();
    dto.id = bet.id;
    dto.username = bet.playerUsername;
    dto.amountCents = Number(bet.amount.value);
    dto.status = RoundBetPublicDto.toPublicStatus(bet);

    if (
      bet.status === BetStatus.CashedOut &&
      bet.cashoutMultiplier !== null &&
      bet.payoutAmount !== null &&
      bet.cashedOutAt !== null
    ) {
      dto.multiplier = bet.cashoutMultiplier.value.toFixed(2);
      dto.payoutCents = Number(bet.payoutAmount.value);
      dto.cashedOutAt = bet.cashedOutAt.toISOString();
    } else {
      dto.multiplier = null;
      dto.payoutCents = null;
      dto.cashedOutAt = null;
    }

    return dto;
  }

  public static fromDomainMany(bets: Bet[], roundStatus: RoundStatus): RoundBetPublicDto[] {
    return bets
      .map((bet) => RoundBetPublicDto.fromDomain(bet, roundStatus))
      .filter((dto): dto is RoundBetPublicDto => dto !== null);
  }

  private static shouldInclude(bet: Bet, roundStatus: RoundStatus): boolean {
    if (bet.status === BetStatus.Pending || bet.status === BetStatus.Rejected) {
      return false;
    }

    if (roundStatus === RoundStatus.Betting) {
      return bet.status === BetStatus.Accepted;
    }

    if (roundStatus === RoundStatus.Running) {
      return bet.status === BetStatus.Accepted || bet.status === BetStatus.CashedOut;
    }

    if (roundStatus === RoundStatus.Crashed || roundStatus === RoundStatus.Finished) {
      return (
        bet.status === BetStatus.CashedOut ||
        bet.status === BetStatus.Lost ||
        bet.status === BetStatus.Accepted
      );
    }

    return false;
  }

  private static toPublicStatus(bet: Bet): RoundBetPublicStatus {
    if (bet.status === BetStatus.CashedOut) {
      return "CASHED_OUT";
    }

    if (bet.status === BetStatus.Lost) {
      return "LOST";
    }

    return "ACCEPTED";
  }
}
