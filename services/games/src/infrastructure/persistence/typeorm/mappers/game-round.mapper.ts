import { GameRound } from "../../../../domain/entities/game-round.entity";
import { RoundStatus } from "../../../../domain/enums/round-status.enum";
import { CrashPoint } from "../../../../domain/value-objects/crash-point.value-object";
import { Multiplier } from "../../../../domain/value-objects/multiplier.value-object";
import { GameRoundOrmEntity } from "../entities/game-round.orm-entity";

export class GameRoundMapper {
  public static toDomain(entity: GameRoundOrmEntity): GameRound {
    return new GameRound({
      id: entity.id,
      status: entity.status as RoundStatus,
      currentMultiplier: Multiplier.fromBasisPoints(entity.currentMultiplier),
      crashPoint: entity.crashPoint !== null ? CrashPoint.fromBasisPoints(entity.crashPoint) : null,
      crashAt: entity.crashAt,
      bettingEndsAt: entity.bettingEndsAt,
      startedAt: entity.startedAt,
      crashedAt: entity.crashedAt,
      finishedAt: entity.finishedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  public static toPersistence(round: GameRound): GameRoundOrmEntity {
    const entity = new GameRoundOrmEntity();

    entity.id = round.id;
    entity.status = round.status;
    entity.currentMultiplier = round.currentMultiplier.valueInBasisPoints;
    entity.crashPoint = round.crashPoint?.valueInBasisPoints ?? null;
    entity.crashAt = round.crashAt;
    entity.bettingEndsAt = round.bettingEndsAt;
    entity.startedAt = round.startedAt;
    entity.crashedAt = round.crashedAt;
    entity.finishedAt = round.finishedAt;
    entity.createdAt = round.createdAt;
    entity.updatedAt = round.updatedAt;

    return entity;
  }
}
