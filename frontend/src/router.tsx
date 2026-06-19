import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { AuthCallbackPage } from "@/pages/auth/auth-callback-page";
import { CrashGamePage } from "@/pages/crash-game/crash-game-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { WebSocketTestPage } from "@/pages/dev/websocket-test-page";
import { HomePage } from "@/pages/home/home-page";
import { useAuthStore } from "@/stores/auth.store";
import { emptyHomeSearch } from "@/router/search";

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    auth_error: typeof search.auth_error === "string" ? search.auth_error : undefined,
    session_expired:
      typeof search.session_expired === "string" ? search.session_expired : undefined,
  }),
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (isInitialized && isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: HomePage,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
  }),
  component: AuthCallbackPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (isInitialized && !isAuthenticated) {
      throw redirect({ to: "/", search: emptyHomeSearch });
    }
  },
  component: DashboardPage,
});

const websocketTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev/websocket",
  component: WebSocketTestPage,
});

const crashGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crash-game",
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (isInitialized && !isAuthenticated) {
      throw redirect({ to: "/", search: emptyHomeSearch });
    }
  },
  component: CrashGamePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authCallbackRoute,
  dashboardRoute,
  websocketTestRoute,
  crashGameRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
