export interface EventBroadcaster {
  broadcast(event: string, payload: unknown): Promise<void>;
}
