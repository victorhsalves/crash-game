import { apiClient } from "@/services/api/api.client";
import type { CurrentGameRound, PlaceBetResponse, RoundHistoryItem, RoundVerification } from "@/types/game.types";

export const gameApi = {
  getCurrentRound(): Promise<CurrentGameRound> {
    return apiClient.get<CurrentGameRound>("/games/rounds/current");
  },

  getRoundHistory(limit = 20, offset = 0): Promise<{ items: RoundHistoryItem[] }> {
    return apiClient.get<{ items: RoundHistoryItem[] }>(
      `/games/rounds/history?limit=${limit}&offset=${offset}`,
    );
  },

  verifyRound(roundId: string): Promise<RoundVerification> {
    return apiClient.get<RoundVerification>(`/games/rounds/${roundId}/verify`);
  },

  placeBet(amountCents: number, socketId?: string): Promise<PlaceBetResponse> {
    return apiClient.post<PlaceBetResponse>("/games/bet", {
      amountCents,
      ...(socketId !== undefined ? { socketId } : {}),
    });
  },
};
