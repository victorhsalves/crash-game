import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { gameApi } from "@/services/game/game.api";

export function useRoundHistory() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["games", "rounds", "history"],
    queryFn: () => gameApi.getRoundHistory(20),
    staleTime: 5_000,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["games", "rounds", "history"] });
  }, [queryClient]);

  return {
    items: query.data?.items ?? [],
    isLoading: query.isLoading,
    refresh,
  };
}
