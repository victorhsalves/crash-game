export interface EventBroadcaster {
  broadcast(event: string, payload: unknown): Promise<void>;
  emitTo(socketId: string, event: string, payload: unknown): Promise<void>;
}
