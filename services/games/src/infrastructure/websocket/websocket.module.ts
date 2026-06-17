import { WebSocketModule } from "@crash/websocket";
import { Module } from "@nestjs/common";
import { InternalTestWebSocketController } from "./internal-test-websocket.controller";

@Module({
  imports: [WebSocketModule.forRoot()],
  controllers: [InternalTestWebSocketController],
  exports: [WebSocketModule],
})
export class WebSocketInfrastructureModule {}
