import { WebSocketModule } from "@crash/websocket";
import { Module } from "@nestjs/common";
import { BetWebSocketNotifier } from "./bet-websocket.notifier";
import { InternalTestWebSocketController } from "./internal-test-websocket.controller";

@Module({
  imports: [WebSocketModule.forRoot()],
  controllers: [InternalTestWebSocketController],
  providers: [BetWebSocketNotifier],
  exports: [WebSocketModule, BetWebSocketNotifier],
})
export class WebSocketInfrastructureModule {}
