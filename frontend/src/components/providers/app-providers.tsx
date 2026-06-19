import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastContainer } from "@/components/ui/toast-container";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { setUnauthorizedHandler } from "@/services/api/api.client";
import { setSessionExpiredHandler } from "@/services/auth/auth.service";
import { emptyHomeSearch } from "@/router/search";
import { router } from "@/router";
import { useAuthStore } from "@/stores/auth.store";

function RouterWithHandlers() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      queryClient.clear();
      void router.navigate({ to: "/", search: { ...emptyHomeSearch, session_expired: "1" } });
    };

    setUnauthorizedHandler(handleSessionExpired);
    setSessionExpiredHandler(handleSessionExpired);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedRouter />
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedRouter() {
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return <RouterProvider router={router} />;
}

export function AppProviders() {
  return <RouterWithHandlers />;
}
