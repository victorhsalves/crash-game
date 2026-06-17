import { Injectable } from "@nestjs/common";
import type { EventBroadcaster } from "../../application/ports/event-broadcaster.port";
import { WebSocketServer } from "./websocket.server";

@Injectable()
export class SocketIoEventBroadcaster implements EventBroadcaster {
  public constructor(private readonly webSocketServer: WebSocketServer) {}

  public async broadcast(event: string, payload: unknown): Promise<void> {
    this.webSocketServer.getServer().emit(event, payload);
  }
}
