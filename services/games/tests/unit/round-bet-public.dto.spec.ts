import { describe, expect, it } from "bun:test";
import { Money } from "@crash/money";
import { Bet } from "../../src/domain/entities/bet.entity";
import { BetStatus } from "../../src/domain/enums/bet-status.enum";
import { RoundStatus } from "../../src/domain/enums/round-status.enum";
import { Multiplier } from "../../src/domain/value-objects/multiplier.value-object";
import { RoundBetPublicDto } from "../../src/presentation/dtos/round-bet-public.dto";

describe("RoundBetPublicDto", () => {
  const baseProps = {
    id: "bet-1",
    playerId: "player-1",
    playerUsername: "player1",
    roundId: "round-1",
    amount: Money.fromCents(5000n),
  };

  it("excludes pending and rejected bets", () => {
    const pending = new Bet({ ...baseProps, status: BetStatus.Pending });
    const rejected = new Bet({ ...baseProps, status: BetStatus.Rejected });

    expect(RoundBetPublicDto.fromDomain(pending, RoundStatus.Betting)).toBeNull();
    expect(RoundBetPublicDto.fromDomain(rejected, RoundStatus.Betting)).toBeNull();
  });

  it("includes only accepted bets during betting phase", () => {
    const accepted = new Bet({ ...baseProps, status: BetStatus.Accepted });
    const cashedOut = new Bet({
      ...baseProps,
      status: BetStatus.CashedOut,
      cashoutMultiplier: Multiplier.fromBasisPoints(200),
      payoutAmount: Money.fromCents(10000n),
      cashedOutAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    expect(RoundBetPublicDto.fromDomain(accepted, RoundStatus.Betting)?.status).toBe("ACCEPTED");
    expect(RoundBetPublicDto.fromDomain(cashedOut, RoundStatus.Betting)).toBeNull();
  });

  it("includes accepted and cashed out bets during running phase", () => {
    const accepted = new Bet({ ...baseProps, status: BetStatus.Accepted });
    const cashedOut = new Bet({
      ...baseProps,
      status: BetStatus.CashedOut,
      cashoutMultiplier: Multiplier.fromBasisPoints(245),
      payoutAmount: Money.fromCents(12250n),
      cashedOutAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const acceptedDto = RoundBetPublicDto.fromDomain(accepted, RoundStatus.Running);
    const cashedOutDto = RoundBetPublicDto.fromDomain(cashedOut, RoundStatus.Running);

    expect(acceptedDto?.status).toBe("ACCEPTED");
    expect(cashedOutDto?.status).toBe("CASHED_OUT");
    expect(cashedOutDto?.multiplier).toBe("2.45");
    expect(cashedOutDto?.payoutCents).toBe(12250);
  });

  it("includes lost bets only after crash settlement", () => {
    const lost = new Bet({ ...baseProps, status: BetStatus.Lost });
    const accepted = new Bet({ ...baseProps, status: BetStatus.Accepted });

    expect(RoundBetPublicDto.fromDomain(lost, RoundStatus.Running)).toBeNull();
    expect(RoundBetPublicDto.fromDomain(lost, RoundStatus.Crashed)?.status).toBe("LOST");
    expect(RoundBetPublicDto.fromDomain(accepted, RoundStatus.Crashed)?.status).toBe("ACCEPTED");
  });
});
