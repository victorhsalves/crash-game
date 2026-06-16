import { apiClient } from "@/services/api/api.client";
import type { AuthenticatedUser } from "@/types/auth.types";

export const authApi = {
  getMe(): Promise<AuthenticatedUser> {
    return apiClient.get<AuthenticatedUser>("/auth/me");
  },
};
