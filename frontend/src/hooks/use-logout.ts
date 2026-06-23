import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { authService } from "@/services/auth/auth.service";
import { defaultHomeSearch } from "@/router/search";
import { websocketService } from "@/services/websocket/websocket.service";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    queryClient.clear();
    websocketService.disconnect();
    authService.logout();
    await navigate({ to: "/", search: defaultHomeSearch });
  }, [navigate, queryClient]);
}
