import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import type { Bet } from "../../../../domain/entities/bet.entity";
import type {
  BetRepository,
  BetTransactionalScope,
} from "../../../../domain/repositories/bet.repository";
import { BetOrmEntity } from "../entities/bet.orm-entity";
import { BetMapper } from "../mappers/bet.mapper";

@Injectable()
export class TypeOrmBetRepository implements BetRepository {
  private readonly repository: Repository<BetOrmEntity>;
  private readonly dataSource: DataSource;

  public constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
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

  public async runInTransaction<T>(work: (scope: BetTransactionalScope) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const scope: BetTransactionalScope = {
        findByIdForUpdate: async (id: string) => {
          const entity = await manager.findOne(BetOrmEntity, {
            where: { id },
            lock: { mode: "pessimistic_write" },
          });

          return entity !== null ? BetMapper.toDomain(entity) : null;
        },
        save: async (bet: Bet) => {
          await manager.save(BetMapper.toPersistence(bet));
        },
      };

      return work(scope);
    });
  }
}
