import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import type {
  FairnessState,
  FairnessStateRepository,
} from "../../../../domain/repositories/fairness-state.repository";
import { FairnessStateOrmEntity } from "../entities/fairness-state.orm-entity";

@Injectable()
export class TypeOrmFairnessStateRepository implements FairnessStateRepository {
  private static readonly StateId = 1;

  private readonly repository: Repository<FairnessStateOrmEntity>;

  public constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(FairnessStateOrmEntity);
  }

  public async getState(): Promise<FairnessState | null> {
    const entity = await this.repository.findOne({
      where: { id: TypeOrmFairnessStateRepository.StateId },
    });

    if (entity === null) {
      return null;
    }

    return this.toDomain(entity);
  }

  public async saveState(state: FairnessState): Promise<void> {
    const entity = new FairnessStateOrmEntity();
    entity.id = state.id;
    entity.terminalSeed = state.terminalSeed;
    entity.chainHeadHash = state.chainHeadHash;
    entity.chainLength = state.chainLength;
    entity.currentChainIndex = state.currentChainIndex;
    entity.nextRoundNonce = state.nextRoundNonce;
    entity.updatedAt = state.updatedAt;
    await this.repository.save(entity);
  }

  private toDomain(entity: FairnessStateOrmEntity): FairnessState {
    return {
      id: entity.id,
      terminalSeed: entity.terminalSeed,
      chainHeadHash: entity.chainHeadHash,
      chainLength: entity.chainLength,
      currentChainIndex: entity.currentChainIndex,
      nextRoundNonce: entity.nextRoundNonce,
      updatedAt: entity.updatedAt,
    };
  }
}
