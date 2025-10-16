import { useAppSelector } from "@/store/hooks";
import { Loader } from "lucide-react";
import { Navigate, Outlet } from "react-router";
import { Spinner } from "../ui/spinner";

interface RouteGuardProps {
  requiredAuth: boolean; // true = protected, false = public
  redirectTo: string;
}

const RouteGuard = ({ requiredAuth, redirectTo }: RouteGuardProps) => {
  const { isAuthenticated, initialized } = useAppSelector(state => state.auth);

  // Wait for auth to be initialized
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>
          <Spinner LoaderIcon={Loader} className="size-8" />
        </div>
      </div>
    );
  }

  const shouldRedirect = requiredAuth ? !isAuthenticated : isAuthenticated;

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
