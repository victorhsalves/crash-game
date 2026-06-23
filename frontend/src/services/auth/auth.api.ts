import { apiClient } from "@/services/api/api.client";
import type { AuthenticatedUser, RegisterInput } from "@/types/auth.types";

export const authApi = {
  getMe(): Promise<AuthenticatedUser> {
    return apiClient.get<AuthenticatedUser>("/auth/me");
  },

  register(input: RegisterInput): Promise<void> {
    return apiClient.post<void>("/auth/register", input);
  },
};
