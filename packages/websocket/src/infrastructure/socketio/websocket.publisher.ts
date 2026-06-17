import { Injectable, Logger } from "@nestjs/common";
import type { EventBroadcaster } from "../../application/ports/event-broadcaster.port";
import { WebSocketServer } from "./websocket.server";

@Injectable()
export class SocketIoEventBroadcaster implements EventBroadcaster {
  private readonly logger = new Logger(SocketIoEventBroadcaster.name);

  public constructor(private readonly webSocketServer: WebSocketServer) {}

  public async broadcast(event: string, payload: unknown): Promise<void> {
    this.webSocketServer.getServer().emit(event, payload);
  }

  public async emitTo(socketId: string, event: string, payload: unknown): Promise<void> {
    const server = this.webSocketServer.getServer();
    const socket = server.sockets.sockets.get(socketId);

    if (socket === undefined) {
      this.logger.warn(`Socket ${socketId} not connected; skipping emit for event ${event}`);
      return;
    }

    server.to(socketId).emit(event, payload);
  }
}
