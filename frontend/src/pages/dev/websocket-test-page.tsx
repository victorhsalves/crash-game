import { useWebSocketTest } from "@/hooks/use-websocket-test";

export function WebSocketTestPage() {
  useWebSocketTest();

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold text-foreground">WebSocket Infrastructure Test</h1>
      <p className="text-muted-foreground">
        Abra o console do browser para ver connect/disconnect e eventos.
      </p>
    </div>
  );
}
