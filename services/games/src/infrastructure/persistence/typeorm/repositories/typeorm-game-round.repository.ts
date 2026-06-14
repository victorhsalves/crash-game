import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import type { GameRound } from "../../../../domain/entities/game-round.entity";
import { RoundStatus } from "../../../../domain/enums/round-status.enum";
import type { GameRoundRepository } from "../../../../domain/repositories/game-round.repository";
import { GameRoundOrmEntity } from "../entities/game-round.orm-entity";
import { GameRoundMapper } from "../mappers/game-round.mapper";

@Injectable()
export class TypeOrmGameRoundRepository implements GameRoundRepository {
  private static readonly ActiveStatuses: readonly RoundStatus[] = [
    RoundStatus.Created,
    RoundStatus.BettingOpen,
    RoundStatus.InProgress,
    RoundStatus.Crashed,
  ];

  private readonly repository: Repository<GameRoundOrmEntity>;

  public constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(GameRoundOrmEntity);
  }

  public async findById(id: string): Promise<GameRound | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity !== null ? GameRoundMapper.toDomain(entity) : null;
  }

  public async findCurrent(): Promise<GameRound | null> {
    const entity = await this.repository
      .createQueryBuilder("round")
      .where("round.status IN (:...statuses)", { statuses: [...TypeOrmGameRoundRepository.ActiveStatuses] })
      .orderBy("round.createdAt", "DESC")
      .getOne();

    return entity !== null ? GameRoundMapper.toDomain(entity) : null;
  }

  public async save(round: GameRound): Promise<void> {
    await this.repository.save(GameRoundMapper.toPersistence(round));
  }
}
