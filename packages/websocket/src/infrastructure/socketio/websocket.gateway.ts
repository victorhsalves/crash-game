import {
  Logger,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
} from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer as WsServerDecorator,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { WebSocketServer } from "./websocket.server";

@WebSocketGateway({ cors: { origin: true } })
export class CrashWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CrashWebSocketGateway.name);

  @WsServerDecorator()
  private server!: Server;

  public constructor(private readonly webSocketServer: WebSocketServer) {}

  public afterInit(server: Server): void {
    this.webSocketServer.setServer(server);
  }

  public handleConnection(_client: Socket): void {
    this.logger.log("client connected");
  }

  public handleDisconnect(_client: Socket): void {
    this.logger.log("client disconnected");
  }
}
