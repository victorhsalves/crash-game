import { Injectable } from "@nestjs/common";
import { DataSource, EntityManager, Repository } from "typeorm";
import type { Wallet } from "../../../../domain/entities/wallet.entity";
import type { WalletRepository } from "../../../../domain/repositories/wallet.repository";
import { WalletOrmEntity } from "../entities/wallet.orm-entity";
import { WalletMapper } from "../mappers/wallet.mapper";

@Injectable()
export class TypeOrmWalletRepository implements WalletRepository {
  public constructor(private readonly manager: DataSource | EntityManager) {}

  private get repository(): Repository<WalletOrmEntity> {
    return this.manager.getRepository(WalletOrmEntity);
  }

  public async findById(id: string): Promise<Wallet | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity !== null ? WalletMapper.toDomain(entity) : null;
  }

  public async findByPlayerId(playerId: string): Promise<Wallet | null> {
    const entity = await this.repository.findOne({ where: { playerId } });

    return entity !== null ? WalletMapper.toDomain(entity) : null;
  }

  public async save(wallet: Wallet): Promise<void> {
    await this.repository.save(WalletMapper.toPersistence(wallet));
  }
}
