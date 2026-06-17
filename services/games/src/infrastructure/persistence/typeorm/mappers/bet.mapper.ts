import { Money } from "@crash/money";
import { Bet } from "../../../../domain/entities/bet.entity";
import { BetStatus } from "../../../../domain/enums/bet-status.enum";
import { Multiplier } from "../../../../domain/value-objects/multiplier.value-object";
import { BetOrmEntity } from "../entities/bet.orm-entity";

export class BetMapper {
  public static toDomain(entity: BetOrmEntity): Bet {
    return new Bet({
      id: entity.id,
      playerId: entity.playerId,
      roundId: entity.roundId,
      amount: Money.fromCents(BigInt(entity.amount)),
      status: entity.status as BetStatus,
      cashoutMultiplier:
        entity.cashoutMultiplier !== null ? Multiplier.fromBasisPoints(entity.cashoutMultiplier) : null,
      payoutAmount: entity.payoutAmount !== null ? Money.fromCents(BigInt(entity.payoutAmount)) : null,
      createdAt: entity.createdAt,
      cashedOutAt: entity.cashedOutAt,
      payoutPublishedAt: entity.payoutPublishedAt,
      socketId: entity.socketId,
    });
  }

  public static toPersistence(bet: Bet): BetOrmEntity {
    const entity = new BetOrmEntity();

    entity.id = bet.id;
    entity.playerId = bet.playerId;
    entity.roundId = bet.roundId;
    entity.amount = bet.amount.value.toString();
    entity.status = bet.status;
    entity.cashoutMultiplier = bet.cashoutMultiplier !== null ? bet.cashoutMultiplier.valueInBasisPoints : null;
    entity.payoutAmount = bet.payoutAmount !== null ? bet.payoutAmount.value.toString() : null;
    entity.createdAt = bet.createdAt;
    entity.cashedOutAt = bet.cashedOutAt;
    entity.payoutPublishedAt = bet.payoutPublishedAt;
    entity.socketId = bet.socketId;

    return entity;
  }
}
