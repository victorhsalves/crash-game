import { apiClient } from "@/services/api/api.client";
import type { CurrentGameRound, PlaceBetResponse } from "@/types/game.types";

export const gameApi = {
  getCurrentRound(): Promise<CurrentGameRound> {
    return apiClient.get<CurrentGameRound>("/games/rounds/current");
  },

  placeBet(amountCents: number): Promise<PlaceBetResponse> {
    return apiClient.post<PlaceBetResponse>("/games/bet", { amountCents });
  },
};
