import { Injectable } from "@nestjs/common";
import { DataSource, EntityManager, Repository } from "typeorm";
import type { WalletTransaction } from "../../../../domain/entities/wallet-transaction.entity";
import type { WalletTransactionRepository } from "../../../../domain/repositories/wallet-transaction.repository";
import { WalletTransactionOrmEntity } from "../entities/wallet-transaction.orm-entity";
import { WalletTransactionMapper } from "../mappers/wallet-transaction.mapper";

@Injectable()
export class TypeOrmWalletTransactionRepository implements WalletTransactionRepository {
  public constructor(private readonly manager: DataSource | EntityManager) {}

  private get repository(): Repository<WalletTransactionOrmEntity> {
    return this.manager.getRepository(WalletTransactionOrmEntity);
  }

  public async findById(id: string): Promise<WalletTransaction | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity !== null ? WalletTransactionMapper.toDomain(entity) : null;
  }

  public async findByReferenceId(referenceId: string): Promise<WalletTransaction | null> {
    const entity = await this.repository.findOne({ where: { referenceId } });

    return entity !== null ? WalletTransactionMapper.toDomain(entity) : null;
  }

  public async findByWalletId(walletId: string): Promise<WalletTransaction[]> {
    const entities = await this.repository.find({ where: { walletId } });

    return entities.map((entity) => WalletTransactionMapper.toDomain(entity));
  }

  public async save(transaction: WalletTransaction): Promise<void> {
    await this.repository.save(WalletTransactionMapper.toPersistence(transaction));
  }
}
