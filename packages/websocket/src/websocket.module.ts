import { type DynamicModule, Module } from "@nestjs/common";
import { EVENT_BROADCASTER } from "./application/tokens";
import { CrashWebSocketGateway } from "./infrastructure/socketio/websocket.gateway";
import { SocketIoEventBroadcaster } from "./infrastructure/socketio/websocket.publisher";
import { WebSocketServer } from "./infrastructure/socketio/websocket.server";

@Module({})
export class WebSocketModule {
  public static forRoot(): DynamicModule {
    return {
      module: WebSocketModule,
      providers: [
        WebSocketServer,
        CrashWebSocketGateway,
        SocketIoEventBroadcaster,
        {
          provide: EVENT_BROADCASTER,
          useExisting: SocketIoEventBroadcaster,
        },
      ],
      exports: [EVENT_BROADCASTER, SocketIoEventBroadcaster, WebSocketServer],
    };
  }
}
