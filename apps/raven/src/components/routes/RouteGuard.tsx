import { useAppSelector } from "@/store/hooks";
import { Navigate, Outlet } from "react-router";

interface RouteGuardProps {
  requiredAuth: boolean; // true = protected, false = public
  redirectTo: string;
}

const RouteGuard = ({ requiredAuth, redirectTo }: RouteGuardProps) => {
  const { isAuthenticated, initialized } = useAppSelector(state => state.auth);

  if (!initialized) {
    return null;
  }

  const shouldRedirect = requiredAuth ? !isAuthenticated : isAuthenticated;

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
