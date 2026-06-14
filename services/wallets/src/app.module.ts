import { Module } from "@nestjs/common";
import { PersistenceModule } from "./infrastructure/persistence/persistence.module";
import { WalletsController } from "./presentation/controllers/wallets.controller";

@Module({
  imports: [PersistenceModule],
  controllers: [WalletsController],
})
export class AppModule {}
