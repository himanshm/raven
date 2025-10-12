import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

interface RouteGuardProps {
  requiredAuth: boolean; // true = protected, false = public
  redirectTo: string;
}

const RouteGuard = ({ requiredAuth, redirectTo }: RouteGuardProps) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, initialized } = useAppSelector(state => state.auth);

  useEffect(() => {
    // initialize auth on first mount
    if (!initialized) {
      dispatch(getCurrentUser());
    }
  }, [initialized, dispatch]);

  // Wait for auth to be initialized
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  //
  const shouldRedirect = requiredAuth ? !isAuthenticated : isAuthenticated;

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
