import { RoundCrashedEvent } from "../events/round-crashed.event";
import { RoundFinishedEvent } from "../events/round-finished.event";
import { RoundStartedEvent } from "../events/round-started.event";
import { DomainError } from "../errors/domain-error";
import { RoundStatus } from "../enums/round-status.enum";
import { AggregateRoot } from "../shared/aggregate-root";
import { CrashPoint } from "../value-objects/crash-point.value-object";
import { Multiplier } from "../value-objects/multiplier.value-object";

export interface GameRoundProps {
  readonly id: string;
  readonly status?: RoundStatus;
  readonly currentMultiplier?: Multiplier;
  readonly crashPoint: CrashPoint;
  readonly bettingEndsAt?: Date | null;
  readonly startedAt?: Date | null;
  readonly crashedAt?: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class GameRound extends AggregateRoot {
  private readonly roundId: string;
  private roundStatus: RoundStatus;
  private roundCurrentMultiplier: Multiplier;
  private readonly roundCrashPoint: CrashPoint;
  private roundBettingEndsAt: Date | null;
  private roundStartedAt: Date | null;
  private roundCrashedAt: Date | null;
  private readonly roundCreatedAt: Date;
  private roundUpdatedAt: Date;

  public constructor(props: GameRoundProps) {
    super();

    if (props.id.trim().length === 0) {
      throw new DomainError("Game round id is required.");
    }

    this.roundId = props.id;
    this.roundStatus = props.status ?? RoundStatus.Waiting;
    this.roundCurrentMultiplier = props.currentMultiplier ?? Multiplier.minimum();
    this.roundCrashPoint = props.crashPoint;
    this.roundBettingEndsAt = props.bettingEndsAt ? new Date(props.bettingEndsAt.getTime()) : null;
    this.roundStartedAt = props.startedAt ? new Date(props.startedAt.getTime()) : null;
    this.roundCrashedAt = props.crashedAt ? new Date(props.crashedAt.getTime()) : null;
    this.roundCreatedAt = props.createdAt ? new Date(props.createdAt.getTime()) : new Date();
    this.roundUpdatedAt = props.updatedAt ? new Date(props.updatedAt.getTime()) : new Date();
  }

  public get id(): string {
    return this.roundId;
  }

  public get status(): RoundStatus {
    return this.roundStatus;
  }

  public get currentMultiplier(): Multiplier {
    return this.roundCurrentMultiplier;
  }

  public get crashPoint(): CrashPoint {
    return this.roundCrashPoint;
  }

  public get bettingEndsAt(): Date | null {
    return this.roundBettingEndsAt ? new Date(this.roundBettingEndsAt.getTime()) : null;
  }

  public get startedAt(): Date | null {
    return this.roundStartedAt ? new Date(this.roundStartedAt.getTime()) : null;
  }

  public get crashedAt(): Date | null {
    return this.roundCrashedAt ? new Date(this.roundCrashedAt.getTime()) : null;
  }

  public get createdAt(): Date {
    return new Date(this.roundCreatedAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.roundUpdatedAt.getTime());
  }

  public openBetting(bettingEndsAt: Date): void {
    if (this.roundStatus !== RoundStatus.Waiting) {
      throw new DomainError("Only a waiting round can open betting.");
    }

    this.roundStatus = RoundStatus.Betting;
    this.roundBettingEndsAt = new Date(bettingEndsAt.getTime());
    this.roundUpdatedAt = new Date();
  }

  public start(): void {
    if (this.roundStatus !== RoundStatus.Betting) {
      throw new DomainError("Only a betting round can be started.");
    }

    const startedAt = new Date();

    this.roundStatus = RoundStatus.Running;
    this.roundCurrentMultiplier = Multiplier.minimum();
    this.roundStartedAt = startedAt;
    this.roundUpdatedAt = startedAt;

    this.addEvent(
      new RoundStartedEvent(
        {
          roundId: this.roundId,
          startedAt: new Date(startedAt.getTime()),
        },
        startedAt,
      ),
    );
  }

  public increaseMultiplier(nextMultiplier: Multiplier): void {
    if (this.roundStatus !== RoundStatus.Running) {
      throw new DomainError("Multiplier can only increase while the round is running.");
    }

    if (!nextMultiplier.isGreaterThan(this.roundCurrentMultiplier)) {
      throw new DomainError("Next multiplier must be greater than the current multiplier.");
    }

    if (nextMultiplier.isGreaterThanOrEqual(this.roundCrashPoint.toMultiplier())) {
      throw new DomainError("Multiplier cannot reach the crash point without crashing the round.");
    }

    this.roundCurrentMultiplier = nextMultiplier;
    this.roundUpdatedAt = new Date();
  }

  public crash(): void {
    if (this.roundStatus !== RoundStatus.Running) {
      throw new DomainError("Only a running round can crash.");
    }

    const crashedAt = new Date();

    this.roundStatus = RoundStatus.Crashed;
    this.roundCurrentMultiplier = this.roundCrashPoint.toMultiplier();
    this.roundCrashedAt = crashedAt;
    this.roundUpdatedAt = crashedAt;

    this.addEvent(
      new RoundCrashedEvent(
        {
          roundId: this.roundId,
          crashPoint: this.roundCrashPoint.value,
          crashedAt: new Date(crashedAt.getTime()),
        },
        crashedAt,
      ),
    );
  }

  public finish(): void {
    if (this.roundStatus !== RoundStatus.Crashed) {
      throw new DomainError("Only a crashed round can be finished.");
    }

    const finishedAt = new Date();

    this.roundStatus = RoundStatus.Finished;
    this.roundUpdatedAt = finishedAt;

    this.addEvent(
      new RoundFinishedEvent(
        {
          roundId: this.roundId,
          finishedAt: new Date(finishedAt.getTime()),
        },
        finishedAt,
      ),
    );
  }
}
