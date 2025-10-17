import DefaultLayout from "@/layouts/DefaultLayout";
import { createBrowserRouter } from "react-router";
import NotFound from "./components/NotFound";
import RouteGuard from "./components/routes/RouteGuard";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/settings/Profile";

const router = createBrowserRouter([
  {
    Component: DefaultLayout,
    children: [
      {
        element: <RouteGuard requiredAuth={true} redirectTo="/login" />,
        children: [
          { index: true, Component: Dashboard },
          { path: "dashboard", Component: Dashboard },
          { path: "settings/profile", Component: Profile }
        ]
      },
      {
        element: <RouteGuard requiredAuth={false} redirectTo="/" />,
        children: [
          { path: "login", Component: Login },
          { path: "register", Component: Register },
          { path: "forgot-password", Component: ForgotPassword }
        ]
      }
    ]
  },
  { path: "*", Component: NotFound }
]);

export default router;
