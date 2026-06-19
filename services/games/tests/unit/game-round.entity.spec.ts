import { describe, expect, it } from "bun:test";
import { PROVABLY_FAIR_TEST_VECTORS } from "@crash/provably-fair";
import { GameRound } from "../../src/domain/entities/game-round.entity";
import { RoundStatus } from "../../src/domain/enums/round-status.enum";
import { DomainError } from "../../src/domain/errors/domain-error";
import { RoundCrashedEvent } from "../../src/domain/events/round-crashed.event";
import { RoundFinishedEvent } from "../../src/domain/events/round-finished.event";
import { RoundStartedEvent } from "../../src/domain/events/round-started.event";
import { CrashCurve } from "../../src/domain/services/crash-curve";
import { CrashPoint } from "../../src/domain/value-objects/crash-point.value-object";
import { Multiplier } from "../../src/domain/value-objects/multiplier.value-object";

describe("GameRound", () => {
  const vector = PROVABLY_FAIR_TEST_VECTORS[0]!;
  const curve = new CrashCurve(0.23);

  function createRoundInBetting(): GameRound {
    const round = GameRound.create({ id: "round-1" });
    round.openBetting(new Date("2024-01-01T00:00:10.000Z"));
    return round;
  }

  function assignFairness(round: GameRound): void {
    round.assignFairnessData({
      serverSeed: vector.input.serverSeed,
      serverSeedHash: vector.serverSeedHash!,
      clientSeed: vector.input.clientSeed,
      nonce: vector.input.nonce,
      chainIndex: 0,
    });
  }

  it("create initializes waiting round with minimum multiplier", () => {
    const round = GameRound.create({ id: "round-1" });

    expect(round.status).toBe(RoundStatus.Waiting);
    expect(round.currentMultiplier.value).toBe(1);
    expect(round.crashPoint).toBeNull();
    expect(round.serverSeed).toBeNull();
  });

  it("rejects empty id", () => {
    expect(() => new GameRound({ id: "  " })).toThrow(DomainError);
  });

  it("follows full happy path lifecycle", () => {
    const round = createRoundInBetting();
    assignFairness(round);
    const crashPoint = CrashPoint.fromBasisPoints(vector.expectedBasisPoints);

    round.start(crashPoint, curve);
    round.crash();
    round.finish();
    round.markSettled(new Date("2024-01-01T00:01:00.000Z"));

    expect(round.status).toBe(RoundStatus.Finished);
    expect(round.settledAt).not.toBeNull();
    expect(round.crashPoint?.valueInBasisPoints).toBe(vector.expectedBasisPoints);
  });

  it("emits domain events on start, crash, and finish", () => {
    const round = createRoundInBetting();
    assignFairness(round);
    const crashPoint = CrashPoint.fromBasisPoints(119);

    round.start(crashPoint, curve);
    const startedEvents = round.pullEvents();
    expect(startedEvents).toHaveLength(1);
    expect(startedEvents[0]).toBeInstanceOf(RoundStartedEvent);

    round.crash();
    const crashedEvents = round.pullEvents();
    expect(crashedEvents).toHaveLength(1);
    expect(crashedEvents[0]).toBeInstanceOf(RoundCrashedEvent);

    round.finish();
    const finishedEvents = round.pullEvents();
    expect(finishedEvents).toHaveLength(1);
    expect(finishedEvents[0]).toBeInstanceOf(RoundFinishedEvent);
  });

  it("markSettled is idempotent", () => {
    const round = createRoundInBetting();
    assignFairness(round);
    round.start(CrashPoint.fromBasisPoints(119), curve);
    round.crash();

    const settledAt = new Date("2024-01-01T00:01:00.000Z");
    round.markSettled(settledAt);
    round.markSettled(new Date("2024-01-01T00:02:00.000Z"));

    expect(round.settledAt?.toISOString()).toBe(settledAt.toISOString());
  });

  it("openBetting rejects when not waiting", () => {
    const round = createRoundInBetting();

    expect(() => round.openBetting(new Date())).toThrow(DomainError);
  });

  it("assignFairnessData rejects when not betting", () => {
    const round = GameRound.create({ id: "round-1" });

    expect(() =>
      assignFairness(round),
    ).toThrow(DomainError);
  });

  it("start rejects without fairness data", () => {
    const round = createRoundInBetting();

    expect(() => round.start(CrashPoint.fromBasisPoints(119), curve)).toThrow(DomainError);
  });

  it("start rejects when not betting", () => {
    const round = GameRound.create({ id: "round-1" });

    expect(() => round.start(CrashPoint.fromBasisPoints(119), curve)).toThrow(DomainError);
  });

  it("crash rejects when not running", () => {
    const round = createRoundInBetting();

    expect(() => round.crash()).toThrow(DomainError);
  });

  it("finish rejects when not crashed", () => {
    const round = createRoundInBetting();
    assignFairness(round);
    round.start(CrashPoint.fromBasisPoints(119), curve);

    expect(() => round.finish()).toThrow(DomainError);
  });

  it("increaseMultiplier updates multiplier while running", () => {
    const round = createRoundInBetting();
    assignFairness(round);
    round.start(CrashPoint.fromBasisPoints(200), curve);

    round.increaseMultiplier(Multiplier.fromBasisPoints(150));

    expect(round.currentMultiplier.valueInBasisPoints).toBe(150);
  });

  it("increaseMultiplier rejects equal or lower multiplier", () => {
    const round = createRoundInBetting();
    assignFairness(round);
    round.start(CrashPoint.fromBasisPoints(200), curve);

    expect(() => round.increaseMultiplier(Multiplier.minimum())).toThrow(DomainError);
  });

  it("increaseMultiplier rejects reaching crash point", () => {
    const round = createRoundInBetting();
    assignFairness(round);
    const crashPoint = CrashPoint.fromBasisPoints(200);
    round.start(crashPoint, curve);

    expect(() => round.increaseMultiplier(crashPoint.toMultiplier())).toThrow(DomainError);
  });

  it("markSettled rejects when round is not crashed or finished", () => {
    const round = createRoundInBetting();

    expect(() => round.markSettled(new Date())).toThrow(DomainError);
  });
});
