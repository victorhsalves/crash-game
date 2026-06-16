import { apiClient } from "@/services/api/api.client";
import type { CurrentGameRound } from "@/types/game.types";

export const gameApi = {
  getCurrentRound(): Promise<CurrentGameRound> {
    return apiClient.get<CurrentGameRound>("/games/rounds/current");
  },
};
