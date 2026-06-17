import { Injectable } from "@nestjs/common";
import type { Server } from "socket.io";

@Injectable()
export class WebSocketServer {
  private server: Server | null = null;

  public setServer(server: Server): void {
    this.server = server;
  }

  public getServer(): Server {
    if (!this.server) {
      throw new Error("WebSocket server not initialized");
    }

    return this.server;
  }
}
