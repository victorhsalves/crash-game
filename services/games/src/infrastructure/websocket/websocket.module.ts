import { WebSocketModule } from "@crash/websocket";
import { Module, forwardRef } from "@nestjs/common";
import { ApplicationModule } from "../../application/application.module";
import { PersistenceModule } from "../persistence/persistence.module";
import { BetWebSocketNotifier } from "./bet-websocket.notifier";
import { GamesWebSocketGateway } from "./games-websocket.gateway";
import { InternalTestWebSocketController } from "./internal-test-websocket.controller";
import { RoundBetWebSocketNotifier } from "./round-bet-websocket.notifier";
import { RoundWebSocketNotifier } from "./round-websocket.notifier";

@Module({
  imports: [
    WebSocketModule.forRoot({ registerDefaultGateway: false }),
    PersistenceModule,
    forwardRef(() => ApplicationModule),
  ],
  controllers: [InternalTestWebSocketController],
  providers: [BetWebSocketNotifier, RoundBetWebSocketNotifier, RoundWebSocketNotifier, GamesWebSocketGateway],
  exports: [WebSocketModule, BetWebSocketNotifier, RoundBetWebSocketNotifier, RoundWebSocketNotifier],
})
export class WebSocketInfrastructureModule {}
