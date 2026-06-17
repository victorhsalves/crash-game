import { WebSocketModule } from "@crash/websocket";
import { Module } from "@nestjs/common";
import { BetWebSocketNotifier } from "./bet-websocket.notifier";
import { InternalTestWebSocketController } from "./internal-test-websocket.controller";
import { RoundWebSocketNotifier } from "./round-websocket.notifier";

@Module({
  imports: [WebSocketModule.forRoot()],
  controllers: [InternalTestWebSocketController],
  providers: [BetWebSocketNotifier, RoundWebSocketNotifier],
  exports: [WebSocketModule, BetWebSocketNotifier, RoundWebSocketNotifier],
})
export class WebSocketInfrastructureModule {}
