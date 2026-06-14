import { Module } from "@nestjs/common";
import { BET_REPOSITORY, GAME_ROUND_REPOSITORY } from "../../application/common/tokens";
import { DatabaseModule } from "./database.module";
import { TypeOrmBetRepository } from "./typeorm/repositories/typeorm-bet.repository";
import { TypeOrmGameRoundRepository } from "./typeorm/repositories/typeorm-game-round.repository";

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: GAME_ROUND_REPOSITORY, useClass: TypeOrmGameRoundRepository },
    { provide: BET_REPOSITORY, useClass: TypeOrmBetRepository },
  ],
  exports: [GAME_ROUND_REPOSITORY, BET_REPOSITORY],
})
export class PersistenceModule {}
