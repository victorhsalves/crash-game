import { describe, expect, it } from "bun:test";
import { Money } from "@crash/money";
import { Bet } from "../../src/domain/entities/bet.entity";
import { BetStatus } from "../../src/domain/enums/bet-status.enum";
import { DomainError } from "../../src/domain/errors/domain-error";
import { BetPlacedEvent } from "../../src/domain/events/bet-placed.event";
import { Multiplier } from "../../src/domain/value-objects/multiplier.value-object";

describe("Bet", () => {
  const baseProps = {
    id: "bet-1",
    playerId: "player-1",
    playerUsername: "player1",
    roundId: "round-1",
  };

  it("place creates pending bet with BetPlacedEvent", () => {
    const amount = Money.fromCents(1000n);
    const { bet, event } = Bet.place({ ...baseProps, amount });

    expect(bet.status).toBe(BetStatus.Pending);
    expect(event).toBeInstanceOf(BetPlacedEvent);
    expect(event.payload.amountCents).toBe(1000n);
    expect(event.payload.betId).toBe("bet-1");
  });

  it("rejects amount below minimum (100 cents)", () => {
    expect(
      () =>
        new Bet({
          ...baseProps,
          amount: Money.fromCents(99n),
        }),
    ).toThrow(DomainError);
  });

  it("accepts minimum and maximum amounts", () => {
    expect(
      () =>
        new Bet({
          ...baseProps,
          amount: Money.fromCents(100n),
        }),
    ).not.toThrow();

    expect(
      () =>
        new Bet({
          ...baseProps,
          amount: Money.fromCents(100_000n),
        }),
    ).not.toThrow();
  });

  it("rejects amount above maximum (100000 cents)", () => {
    expect(
      () =>
        new Bet({
          ...baseProps,
          amount: Money.fromCents(100_001n),
        }),
    ).toThrow(DomainError);
  });

  it("rejects empty ids", () => {
    expect(
      () =>
        new Bet({
          ...baseProps,
          id: "  ",
          amount: Money.fromCents(100n),
        }),
    ).toThrow(DomainError);
  });

  it("accept transitions from pending to accepted", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Pending });

    bet.accept();

    expect(bet.status).toBe(BetStatus.Accepted);
  });

  it("accept is idempotent when not pending", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Accepted });

    bet.accept();

    expect(bet.status).toBe(BetStatus.Accepted);
  });

  it("reject transitions from pending to rejected", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Pending });

    bet.reject();

    expect(bet.status).toBe(BetStatus.Rejected);
  });

  it("canCashout returns true only for accepted bets", () => {
    const pending = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Pending });
    const accepted = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Accepted });

    expect(pending.canCashout()).toBe(false);
    expect(accepted.canCashout()).toBe(true);
  });

  it.each([
    { amountCents: 100n, basisPoints: 101, expectedPayout: 101n },
    { amountCents: 1000n, basisPoints: 250, expectedPayout: 2500n },
    { amountCents: 100_000n, basisPoints: 1000, expectedPayout: 1_000_000n },
  ])("cashout payout for $amountCents at $basisPoints bp", ({ amountCents, basisPoints, expectedPayout }) => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(amountCents), status: BetStatus.Accepted });
    const multiplier = Multiplier.fromBasisPoints(basisPoints);
    const at = new Date("2024-01-01T00:00:00.000Z");

    bet.cashout(multiplier, at);

    expect(bet.status).toBe(BetStatus.CashedOut);
    expect(bet.payoutAmount?.value).toBe(expectedPayout);
    expect(bet.cashoutMultiplier?.valueInBasisPoints).toBe(basisPoints);
  });

  it("cashout is idempotent", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Accepted });
    const multiplier = Multiplier.fromBasisPoints(200);
    const at = new Date("2024-01-01T00:00:00.000Z");

    bet.cashout(multiplier, at);
    const firstPayout = bet.payoutAmount?.value;

    bet.cashout(Multiplier.fromBasisPoints(300), at);

    expect(bet.payoutAmount?.value).toBe(firstPayout);
  });

  it("cashout throws when bet is not accepted", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Pending });

    expect(() => bet.cashout(Multiplier.fromBasisPoints(150), new Date())).toThrow(DomainError);
  });

  it("lose transitions accepted bet to lost", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Accepted });
    const at = new Date("2024-01-01T00:00:00.000Z");

    bet.lose(at);

    expect(bet.status).toBe(BetStatus.Lost);
  });

  it("lose is idempotent", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Lost });
    const at = new Date("2024-01-01T00:00:00.000Z");

    expect(() => bet.lose(at)).not.toThrow();
    expect(bet.status).toBe(BetStatus.Lost);
  });

  it("lose throws when bet is not accepted or already lost", () => {
    const pending = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Pending });

    expect(() => pending.lose(new Date())).toThrow(DomainError);
  });

  it("markPayoutPublished sets timestamp for cashed out bet", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.CashedOut });
    const at = new Date("2024-01-01T00:00:00.000Z");

    bet.markPayoutPublished(at);

    expect(bet.payoutPublishedAt?.toISOString()).toBe(at.toISOString());
  });

  it("markPayoutPublished is idempotent", () => {
    const at = new Date("2024-01-01T00:00:00.000Z");
    const bet = new Bet({
      ...baseProps,
      amount: Money.fromCents(1000n),
      status: BetStatus.CashedOut,
      payoutPublishedAt: at,
    });

    bet.markPayoutPublished(new Date("2024-01-02T00:00:00.000Z"));

    expect(bet.payoutPublishedAt?.toISOString()).toBe(at.toISOString());
  });

  it("markPayoutPublished throws when bet is not cashed out", () => {
    const bet = new Bet({ ...baseProps, amount: Money.fromCents(1000n), status: BetStatus.Accepted });

    expect(() => bet.markPayoutPublished(new Date())).toThrow(DomainError);
  });
});
