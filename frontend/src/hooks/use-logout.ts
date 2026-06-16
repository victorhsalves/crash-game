import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { authService } from "@/services/auth/auth.service";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    queryClient.clear();
    authService.logout();
    await navigate({ to: "/" });
  }, [navigate, queryClient]);
}
