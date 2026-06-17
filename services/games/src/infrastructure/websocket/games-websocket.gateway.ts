import { SocketJwtAuthService, WsJwtGuard } from "@crash/auth";
import { WebSocketServer } from "@crash/websocket";
import {
  Logger,
  UseGuards,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
} from "@nestjs/common";
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer as WsServerDecorator,
} from "@nestjs/websockets";
import type { Server } from "socket.io";
import { CashoutBetUseCase } from "../../application/use-cases/cashout-bet/cashout-bet.use-case";
import type { AuthenticatedSocket } from "./authenticated-socket";
import { BetWebSocketNotifier } from "./bet-websocket.notifier";
import { mapCashoutError } from "./cashout-error.mapper";
import { WebSocketBetEvents } from "./contracts/websocket-bet-events";

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
    private readonly cashoutBetUseCase: CashoutBetUseCase,
    private readonly betWebSocketNotifier: BetWebSocketNotifier,
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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(WebSocketBetEvents.Cashout)
  public async handleCashout(@ConnectedSocket() client: AuthenticatedSocket): Promise<void> {
    const playerId = client.data.user.id;

    try {
      const result = await this.cashoutBetUseCase.execute({ playerId });
      await this.betWebSocketNotifier.notifyUpdated(client, result);
    } catch (error) {
      const mapped = mapCashoutError(error);
      client.emit(WebSocketBetEvents.CashoutFailed, mapped);
    }
  }
}
