import { io, type Socket } from "socket.io-client";
import { useEffect } from "react";

export function useWebSocketTest(): void {
  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL;
    const socket: Socket = io(url);

    socket.on("connect", () => {
      console.log("[ws-test] connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("[ws-test] disconnected");
    });

    socket.on("infrastructure.test", (payload: unknown) => {
      console.log("[ws-test] infrastructure.test:", payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
