import { AuthModule } from "@crash/auth";
import { Module } from "@nestjs/common";
import { ApplicationModule } from "./application/application.module";
import { LifecycleModule } from "./infrastructure/lifecycle/lifecycle.module";
import { MessagingInfrastructureModule } from "./infrastructure/messaging/messaging.module";
import { PersistenceModule } from "./infrastructure/persistence/persistence.module";
import { WebSocketInfrastructureModule } from "./infrastructure/websocket/websocket.module";
import { GamesController } from "./presentation/controllers/games.controller";

@Module({
  imports: [
    AuthModule.forRoot(),
    PersistenceModule,
    ApplicationModule,
    MessagingInfrastructureModule,
    WebSocketInfrastructureModule,
    LifecycleModule,
  ],
  controllers: [GamesController],
})
export class AppModule {}
