import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import type { GameRound } from "../../../../domain/entities/game-round.entity";
import { RoundStatus } from "../../../../domain/enums/round-status.enum";
import type { GameRoundRepository, RoundHistoryItem } from "../../../../domain/repositories/game-round.repository";
import { GameRoundOrmEntity } from "../entities/game-round.orm-entity";
import { GameRoundMapper } from "../mappers/game-round.mapper";

@Injectable()
export class TypeOrmGameRoundRepository implements GameRoundRepository {
  private static readonly CurrentStatuses: readonly RoundStatus[] = [
    RoundStatus.Betting,
    RoundStatus.Running,
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
      .where("round.status IN (:...statuses)", { statuses: [...TypeOrmGameRoundRepository.CurrentStatuses] })
      .orderBy("round.createdAt", "DESC")
      .getOne();

    return entity !== null ? GameRoundMapper.toDomain(entity) : null;
  }

  public async findNextWaiting(): Promise<GameRound | null> {
    const entity = await this.repository
      .createQueryBuilder("round")
      .where("round.status = :status", { status: RoundStatus.Waiting })
      .orderBy("round.createdAt", "ASC")
      .getOne();

    return entity !== null ? GameRoundMapper.toDomain(entity) : null;
  }

  public async findUnsettled(): Promise<GameRound | null> {
    const entity = await this.repository
      .createQueryBuilder("round")
      .where("round.status IN (:...statuses)", {
        statuses: [RoundStatus.Crashed, RoundStatus.Finished],
      })
      .andWhere("round.settledAt IS NULL")
      .orderBy("round.createdAt", "DESC")
      .getOne();

    return entity !== null ? GameRoundMapper.toDomain(entity) : null;
  }

  public async findHistory(limit: number, offset: number): Promise<RoundHistoryItem[]> {
    const entities = await this.repository
      .createQueryBuilder("round")
      .where("round.status IN (:...statuses)", {
        statuses: [RoundStatus.Crashed, RoundStatus.Finished],
      })
      .andWhere("round.crashPoint IS NOT NULL")
      .andWhere("round.crashedAt IS NOT NULL")
      .andWhere("round.serverSeedHash IS NOT NULL")
      .orderBy("round.crashedAt", "DESC")
      .offset(offset)
      .limit(limit)
      .getMany();

    return entities.map((entity) => ({
      id: entity.id,
      crashPointBasisPoints: entity.crashPoint!,
      crashedAt: entity.crashedAt!,
      serverSeedHash: entity.serverSeedHash!,
    }));
  }

  public async save(round: GameRound): Promise<void> {
    await this.repository.save(GameRoundMapper.toPersistence(round));
  }
}
