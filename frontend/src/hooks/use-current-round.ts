import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/services/api/api-error";
import { gameApi } from "@/services/game/game.api";
import { useAuth } from "@/hooks/use-auth";

export function useCurrentRound() {
  const { isAuthenticated, isInitialized } = useAuth();

  return useQuery({
    queryKey: ["games", "rounds", "current"],
    queryFn: () => gameApi.getCurrentRound(),
    enabled: isInitialized && isAuthenticated,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function isNoActiveRoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
