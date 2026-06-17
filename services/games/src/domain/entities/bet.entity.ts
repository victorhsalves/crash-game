import { Money } from "@crash/money";
import { BetStatus } from "../enums/bet-status.enum";
import { DomainError } from "../errors/domain-error";
import { BetPlacedEvent } from "../events/bet-placed.event";
import { CashoutRequestedEvent } from "../events/cashout-requested.event";
import { Multiplier } from "../value-objects/multiplier.value-object";

export interface BetProps {
  readonly id: string;
  readonly playerId: string;
  readonly roundId: string;
  readonly amount: Money;
  readonly status?: BetStatus;
  readonly socketId?: string | null;
  readonly cashoutMultiplier?: Multiplier | null;
  readonly payoutAmount?: Money | null;
  readonly createdAt?: Date;
  readonly cashedOutAt?: Date | null;
}

export interface PlaceBetProps {
  readonly id: string;
  readonly playerId: string;
  readonly roundId: string;
  readonly amount: Money;
  readonly socketId?: string | null;
  readonly createdAt?: Date;
}

export interface PlacedBet {
  readonly bet: Bet;
  readonly event: BetPlacedEvent;
}

export class Bet {
  private static readonly MinimumAmount = Money.fromCents(100n);
  private static readonly MaximumAmount = Money.fromCents(100_000n);

  private readonly betId: string;
  private readonly betPlayerId: string;
  private readonly betRoundId: string;
  private readonly betAmount: Money;
  private betStatus: BetStatus;
  private betCashoutMultiplier: Multiplier | null;
  private betPayoutAmount: Money | null;
  private readonly betCreatedAt: Date;
  private betCashedOutAt: Date | null;
  private readonly betSocketId: string | null;

  public constructor(props: BetProps) {
    if (props.id.trim().length === 0) {
      throw new DomainError("Bet id is required.");
    }

    if (props.playerId.trim().length === 0) {
      throw new DomainError("Bet player id is required.");
    }

    if (props.roundId.trim().length === 0) {
      throw new DomainError("Bet round id is required.");
    }

    if (props.amount.lessThan(Bet.MinimumAmount)) {
      throw new DomainError("Bet amount must be at least 1.00.");
    }

    if (props.amount.greaterThan(Bet.MaximumAmount)) {
      throw new DomainError("Bet amount must be less than or equal to 1,000.00.");
    }

    this.betId = props.id;
    this.betPlayerId = props.playerId;
    this.betRoundId = props.roundId;
    this.betAmount = props.amount;
    this.betStatus = props.status ?? BetStatus.Pending;
    this.betCashoutMultiplier = props.cashoutMultiplier ?? null;
    this.betPayoutAmount = props.payoutAmount ?? null;
    this.betCreatedAt = props.createdAt ? new Date(props.createdAt.getTime()) : new Date();
    this.betCashedOutAt = props.cashedOutAt ? new Date(props.cashedOutAt.getTime()) : null;
    this.betSocketId = props.socketId ?? null;
  }

  public static place(props: PlaceBetProps): PlacedBet {
    const bet = new Bet({
      ...props,
      status: BetStatus.Pending,
    });

    return {
      bet,
      event: new BetPlacedEvent(
        {
          betId: bet.id,
          playerId: bet.playerId,
          roundId: bet.roundId,
          amountCents: bet.amount.value,
        },
        bet.createdAt,
      ),
    };
  }

  public get id(): string {
    return this.betId;
  }

  public get playerId(): string {
    return this.betPlayerId;
  }

  public get roundId(): string {
    return this.betRoundId;
  }

  public get amount(): Money {
    return this.betAmount;
  }

  public get status(): BetStatus {
    return this.betStatus;
  }

  public get cashoutMultiplier(): Multiplier | null {
    return this.betCashoutMultiplier;
  }

  public get payoutAmount(): Money | null {
    return this.betPayoutAmount;
  }

  public get createdAt(): Date {
    return new Date(this.betCreatedAt.getTime());
  }

  public get cashedOutAt(): Date | null {
    return this.betCashedOutAt ? new Date(this.betCashedOutAt.getTime()) : null;
  }

  public get socketId(): string | null {
    return this.betSocketId;
  }

  public cashout(multiplier: Multiplier): CashoutRequestedEvent {
    if (this.betStatus !== BetStatus.Accepted) {
      throw new DomainError("Only an accepted bet can be cashed out.");
    }

    const cashedOutAt = new Date();
    const payoutAmount = Money.fromCents(
      (this.betAmount.value * BigInt(multiplier.valueInBasisPoints)) / BigInt(Multiplier.Scale),
    );

    this.betStatus = BetStatus.CashedOut;
    this.betCashoutMultiplier = multiplier;
    this.betPayoutAmount = payoutAmount;
    this.betCashedOutAt = cashedOutAt;

    return new CashoutRequestedEvent(
      {
        betId: this.betId,
        playerId: this.betPlayerId,
        roundId: this.betRoundId,
        cashoutMultiplier: multiplier.value,
        payoutAmountCents: payoutAmount.value,
      },
      cashedOutAt,
    );
  }

  public accept(): void {
    if (this.betStatus !== BetStatus.Pending) {
      return;
    }

    this.betStatus = BetStatus.Accepted;
  }

  public reject(): void {
    if (this.betStatus !== BetStatus.Pending) {
      return;
    }

    this.betStatus = BetStatus.Rejected;
  }
}
