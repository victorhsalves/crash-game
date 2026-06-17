import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/services/api/api-error";
import { gameApi } from "@/services/game/game.api";
import type { EventLogSource } from "@/types/event-log.types";

interface PlaceBetVariables {
  amountCents: number;
  socketId?: string;
}

interface UsePlaceBetOptions {
  append: (source: EventLogSource, event: string, payload?: unknown) => void;
}

function parseApiError(error: unknown): unknown {
  if (!(error instanceof ApiError)) {
    return { message: error instanceof Error ? error.message : "Unknown error" };
  }

  try {
    return JSON.parse(error.message);
  } catch {
    return { statusCode: error.status, message: error.message };
  }
}

export function usePlaceBet({ append }: UsePlaceBetOptions) {
  const mutation = useMutation({
    mutationFn: ({ amountCents, socketId }: PlaceBetVariables) =>
      gameApi.placeBet(amountCents, socketId),
    onSuccess: (response) => {
      append("api", "placeBet", response);
    },
    onError: (error) => {
      append("api", "placeBet.error", parseApiError(error));
    },
  });

  return {
    placeBet: mutation.mutate,
    isPending: mutation.isPending,
  };
}
