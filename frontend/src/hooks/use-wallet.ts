import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/services/api/api-error";
import { walletApi } from "@/services/wallet/wallet.api";
import { useAuth } from "@/hooks/use-auth";

async function fetchOrCreateWallet() {
  try {
    return await walletApi.getMyWallet();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return walletApi.createWallet();
    }

    if (error instanceof ApiError && error.status === 409) {
      return walletApi.getMyWallet();
    }

    throw error;
  }
}

export function useWallet() {
  const { isAuthenticated, isInitialized } = useAuth();

  return useQuery({
    queryKey: ["wallet", "me"],
    queryFn: fetchOrCreateWallet,
    enabled: isInitialized && isAuthenticated,
    retry: false,
  });
}
