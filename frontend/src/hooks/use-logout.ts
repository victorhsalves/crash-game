import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authService } from "@/services/auth/auth.service";
import { websocketService } from "@/services/websocket/websocket.service";

export function useLogout() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    queryClient.clear();
    websocketService.disconnect();
    await authService.logout();
  }, [queryClient]);
}
