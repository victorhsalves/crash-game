import { Module } from "@nestjs/common";
import { BET_REPOSITORY, FAIRNESS_STATE_REPOSITORY, GAME_ROUND_REPOSITORY } from "../../application/common/tokens";
import { DatabaseModule } from "./database.module";
import { TypeOrmBetRepository } from "./typeorm/repositories/typeorm-bet.repository";
import { TypeOrmFairnessStateRepository } from "./typeorm/repositories/typeorm-fairness-state.repository";
import { TypeOrmGameRoundRepository } from "./typeorm/repositories/typeorm-game-round.repository";

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: GAME_ROUND_REPOSITORY, useClass: TypeOrmGameRoundRepository },
    { provide: BET_REPOSITORY, useClass: TypeOrmBetRepository },
    { provide: FAIRNESS_STATE_REPOSITORY, useClass: TypeOrmFairnessStateRepository },
  ],
  exports: [GAME_ROUND_REPOSITORY, BET_REPOSITORY, FAIRNESS_STATE_REPOSITORY],
})
export class PersistenceModule {}
