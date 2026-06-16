import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return { isAuthenticated, isLoading, isInitialized };
}
