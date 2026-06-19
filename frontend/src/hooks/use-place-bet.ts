import { useMutation } from "@tanstack/react-query";
import { parseApiError } from "@/services/api/api-error";
import { gameApi } from "@/services/game/game.api";
import { resolveErrorMessage } from "@/lib/resolve-error-message";
import { toast } from "@/stores/toast.store";
import type { EventLogSource } from "@/types/event-log.types";

import type { PlaceBetResponse } from "@/types/game.types";

interface PlaceBetVariables {
  amountCents: number;
  socketId?: string;
}

interface UsePlaceBetOptions {
  append: (source: EventLogSource, event: string, payload?: unknown) => void;
  onSuccess?: (response: PlaceBetResponse) => void;
}

export function usePlaceBet({ append, onSuccess }: UsePlaceBetOptions) {
  const mutation = useMutation({
    mutationFn: ({ amountCents, socketId }: PlaceBetVariables) =>
      gameApi.placeBet(amountCents, socketId),
    onSuccess: (response) => {
      append("api", "placeBet", response);
      onSuccess?.(response);
    },
    onError: (error) => {
      append("api", "placeBet.error", parseApiError(error));
      toast.error(resolveErrorMessage(error));
    },
  });

  return {
    placeBet: mutation.mutate,
    isPending: mutation.isPending,
  };
}
