import { useCallback, useEffect, useState } from "react";
import { verifyRoundAsync } from "@crash/provably-fair/browser";
import { gameApi } from "@/services/game/game.api";
import type { VerificationState } from "@/types/game.types";

const initialState: VerificationState = {
  status: "idle",
  result: null,
  apiData: null,
  errorMessage: null,
};

export function useRoundVerification(roundId: string | null, enabled: boolean) {
  const [state, setState] = useState<VerificationState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  useEffect(() => {
    if (!enabled || roundId === null) {
      reset();
      return;
    }

    let cancelled = false;

    const runVerification = async () => {
      setState({
        status: "loading",
        result: null,
        apiData: null,
        errorMessage: null,
      });

      try {
        const apiData = await gameApi.verifyRound(roundId);

        if (apiData.serverSeed === null || apiData.serverSeedHash === null || apiData.clientSeed === null || apiData.nonce === null || apiData.crashPoint === null) {
          if (!cancelled) {
            setState({
              status: "error",
              result: null,
              apiData,
              errorMessage: "Dados de verificacao ainda nao disponiveis para esta rodada.",
            });
          }
          return;
        }

        const crashPointBasisPoints = Math.round(Number(apiData.crashPoint) * 100);
        const result = await verifyRoundAsync({
          serverSeed: apiData.serverSeed,
          serverSeedHash: apiData.serverSeedHash,
          clientSeed: apiData.clientSeed,
          nonce: apiData.nonce,
          crashPointBasisPoints,
        });

        if (!cancelled) {
          setState({
            status: "success",
            result,
            apiData,
            errorMessage: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            result: null,
            apiData: null,
            errorMessage: error instanceof Error ? error.message : "Falha ao verificar rodada.",
          });
        }
      }
    };

    void runVerification();

    return () => {
      cancelled = true;
    };
  }, [enabled, reset, roundId]);

  return { state, reset };
}
