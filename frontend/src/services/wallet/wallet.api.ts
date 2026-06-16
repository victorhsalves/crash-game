import { apiClient } from "@/services/api/api.client";
import type { Wallet } from "@/types/wallet.types";

export const walletApi = {
  getMyWallet(): Promise<Wallet> {
    return apiClient.get<Wallet>("/wallets/me");
  },

  createWallet(): Promise<Wallet> {
    return apiClient.post<Wallet>("/wallets");
  },
};
