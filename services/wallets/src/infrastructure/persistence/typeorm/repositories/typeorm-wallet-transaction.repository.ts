import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import type { WalletTransaction } from "../../../../domain/entities/wallet-transaction.entity";
import type { WalletTransactionRepository } from "../../../../domain/repositories/wallet-transaction.repository";
import { WalletTransactionOrmEntity } from "../entities/wallet-transaction.orm-entity";
import { WalletTransactionMapper } from "../mappers/wallet-transaction.mapper";

@Injectable()
export class TypeOrmWalletTransactionRepository implements WalletTransactionRepository {
  private readonly repository: Repository<WalletTransactionOrmEntity>;

  public constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(WalletTransactionOrmEntity);
  }

  public async findById(id: string): Promise<WalletTransaction | null> {
    const entity = await this.repository.findOne({ where: { id } });

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
