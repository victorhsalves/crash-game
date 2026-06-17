import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { WebSocketTestPage } from "@/pages/dev/websocket-test-page";
import { HomePage } from "@/pages/home/home-page";
import { useAuthStore } from "@/stores/auth.store";

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
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (isInitialized && isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: HomePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    if (isInitialized && !isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: DashboardPage,
});

const websocketTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev/websocket",
  component: WebSocketTestPage,
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, websocketTestRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
