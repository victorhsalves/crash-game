import { Module } from "@nestjs/common";
import { PersistenceModule } from "../infrastructure/persistence/persistence.module";
import { GetCurrentRoundUseCase } from "./use-cases/get-current-round/get-current-round.use-case";

@Module({
  imports: [PersistenceModule],
  providers: [GetCurrentRoundUseCase],
  exports: [GetCurrentRoundUseCase],
})
export class ApplicationModule {}
