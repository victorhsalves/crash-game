import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import type { Bet } from "../../../../domain/entities/bet.entity";
import type { BetRepository } from "../../../../domain/repositories/bet.repository";
import { BetOrmEntity } from "../entities/bet.orm-entity";
import { BetMapper } from "../mappers/bet.mapper";

@Injectable()
export class TypeOrmBetRepository implements BetRepository {
  private readonly repository: Repository<BetOrmEntity>;

  public constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(BetOrmEntity);
  }

  public async findById(id: string): Promise<Bet | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity !== null ? BetMapper.toDomain(entity) : null;
  }

  public async findByRoundId(roundId: string): Promise<Bet[]> {
    const entities = await this.repository.find({ where: { roundId } });

    return entities.map((entity) => BetMapper.toDomain(entity));
  }

  public async findByPlayerId(playerId: string): Promise<Bet[]> {
    const entities = await this.repository.find({ where: { playerId } });

    return entities.map((entity) => BetMapper.toDomain(entity));
  }

  public async findByPlayerIdAndRoundId(playerId: string, roundId: string): Promise<Bet | null> {
    const entity = await this.repository.findOne({ where: { playerId, roundId } });

    return entity !== null ? BetMapper.toDomain(entity) : null;
  }

  public async save(bet: Bet): Promise<void> {
    await this.repository.save(BetMapper.toPersistence(bet));
  }
}
