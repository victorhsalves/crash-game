import { AuthModule } from "@crash/auth";
import { Module } from "@nestjs/common";
import { ApplicationModule } from "./application/application.module";
import { MessagingInfrastructureModule } from "./infrastructure/messaging/messaging.module";
import { PersistenceModule } from "./infrastructure/persistence/persistence.module";
import { GamesController } from "./presentation/controllers/games.controller";

@Module({
  imports: [AuthModule.forRoot(), PersistenceModule, ApplicationModule, MessagingInfrastructureModule],
  controllers: [GamesController],
})
export class AppModule {}
