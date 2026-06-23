import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { CrashGamePage } from "@/pages/crash-game/crash-game-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { WebSocketTestPage } from "@/pages/dev/websocket-test-page";
import { HomePage } from "@/pages/home/home-page";
import { RegisterPage } from "@/pages/register/register-page";
import { useAuthStore } from "@/stores/auth.store";
import { defaultHomeSearch } from "@/router/search";

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

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (isInitialized && isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RegisterPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (isInitialized && !isAuthenticated) {
      throw redirect({ to: "/", search: defaultHomeSearch });
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
      throw redirect({ to: "/", search: defaultHomeSearch });
    }
  },
  component: CrashGamePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  registerRoute,
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
