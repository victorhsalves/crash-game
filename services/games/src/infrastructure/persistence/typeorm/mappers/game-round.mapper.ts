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
      crashPoint: CrashPoint.fromBasisPoints(entity.crashPoint),
      startedAt: entity.startedAt,
      crashedAt: entity.crashedAt,
      createdAt: entity.createdAt,
    });
  }

  public static toPersistence(round: GameRound): GameRoundOrmEntity {
    const entity = new GameRoundOrmEntity();

    entity.id = round.id;
    entity.status = round.status;
    entity.currentMultiplier = round.currentMultiplier.valueInBasisPoints;
    entity.crashPoint = round.crashPoint.valueInBasisPoints;
    entity.startedAt = round.startedAt;
    entity.crashedAt = round.crashedAt;
    entity.createdAt = round.createdAt;

    return entity;
  }
}
