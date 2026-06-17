import { type DynamicModule, type ModuleMetadata, Module } from "@nestjs/common";
import { EVENT_BROADCASTER } from "./application/tokens";
import { CrashWebSocketGateway } from "./infrastructure/socketio/websocket.gateway";
import { SocketIoEventBroadcaster } from "./infrastructure/socketio/websocket.publisher";
import { WebSocketServer } from "./infrastructure/socketio/websocket.server";

export interface WebSocketModuleOptions {
  readonly registerDefaultGateway?: boolean;
}

@Module({})
export class WebSocketModule {
  public static forRoot(options: WebSocketModuleOptions = {}): DynamicModule {
    const registerDefaultGateway = options.registerDefaultGateway ?? true;
    const providers: ModuleMetadata["providers"] = [
      WebSocketServer,
      SocketIoEventBroadcaster,
      {
        provide: EVENT_BROADCASTER,
        useExisting: SocketIoEventBroadcaster,
      },
    ];

    if (registerDefaultGateway) {
      providers.push(CrashWebSocketGateway);
    }

    return {
      module: WebSocketModule,
      providers,
      exports: [EVENT_BROADCASTER, SocketIoEventBroadcaster, WebSocketServer],
    };
  }
}
