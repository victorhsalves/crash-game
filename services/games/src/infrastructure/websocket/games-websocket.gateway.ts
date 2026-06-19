import { SocketJwtAuthService } from "@crash/auth";
import { WebSocketServer } from "@crash/websocket";
import {
  Logger,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
} from "@nestjs/common";
import { WebSocketGateway, WebSocketServer as WsServerDecorator } from "@nestjs/websockets";
import type { Server } from "socket.io";
import type { AuthenticatedSocket } from "./authenticated-socket";

@WebSocketGateway({ cors: { origin: true } })
export class GamesWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GamesWebSocketGateway.name);

  @WsServerDecorator()
  private server!: Server;

  public constructor(
    private readonly webSocketServer: WebSocketServer,
    private readonly socketJwtAuthService: SocketJwtAuthService,
  ) {}

  public afterInit(server: Server): void {
    this.webSocketServer.setServer(server);
  }

  public async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const user = await this.socketJwtAuthService.authenticateHandshake(client.handshake);

    if (user === null) {
      this.logger.debug("WebSocket connection rejected: invalid or missing JWT");
      client.disconnect();
      return;
    }

    client.data.user = user;
    this.logger.log(`client connected: ${user.id}`);
  }

  public handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data?.user?.id ?? "unknown";
    this.logger.log(`client disconnected: ${userId}`);
  }
}
