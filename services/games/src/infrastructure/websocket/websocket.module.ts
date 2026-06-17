import { WebSocketModule } from "@crash/websocket";
import { Module, forwardRef } from "@nestjs/common";
import { ApplicationModule } from "../../application/application.module";
import { BetWebSocketNotifier } from "./bet-websocket.notifier";
import { GamesWebSocketGateway } from "./games-websocket.gateway";
import { InternalTestWebSocketController } from "./internal-test-websocket.controller";
import { RoundWebSocketNotifier } from "./round-websocket.notifier";

@Module({
  imports: [
    WebSocketModule.forRoot({ registerDefaultGateway: false }),
    forwardRef(() => ApplicationModule),
  ],
  controllers: [InternalTestWebSocketController],
  providers: [BetWebSocketNotifier, RoundWebSocketNotifier, GamesWebSocketGateway],
  exports: [WebSocketModule, BetWebSocketNotifier, RoundWebSocketNotifier],
})
export class WebSocketInfrastructureModule {}
