import { Module } from "@nestjs/common";
import { PersistenceModule } from "./infrastructure/persistence/persistence.module";
import { GamesController } from "./presentation/controllers/games.controller";

@Module({
  imports: [PersistenceModule],
  controllers: [GamesController],
})
export class AppModule {}
