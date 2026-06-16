import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/services/auth/auth.api";
import { useAuth } from "@/hooks/use-auth";

export function useCurrentUser() {
  const { isAuthenticated, isInitialized } = useAuth();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    enabled: isInitialized && isAuthenticated,
    retry: false,
  });
}
