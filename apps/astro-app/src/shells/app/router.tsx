import { DashboardContent } from "@/components/dashboard-content";
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => {
    return (
      <div>
        <Outlet />
      </div>
    );
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: () => {
    return <DashboardContent />;
  },
});

const routeTree = rootRoute.addChildren([dashboardRoute]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const Router = () => <RouterProvider router={router} />;

export { Router };
