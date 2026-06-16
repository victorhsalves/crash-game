import { AuthModule } from "@crash/auth";
import { Module } from "@nestjs/common";
import { ApplicationModule } from "./application/application.module";
import { PersistenceModule } from "./infrastructure/persistence/persistence.module";
import { WalletsController } from "./presentation/controllers/wallets.controller";

@Module({
  imports: [AuthModule.forRoot(), PersistenceModule, ApplicationModule],
  controllers: [WalletsController],
})
export class AppModule {}
