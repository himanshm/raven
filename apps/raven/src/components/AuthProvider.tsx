import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";
import { Loader } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Spinner } from "./ui/spinner";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const { initialized, initializing } = useAppSelector(state => state.auth);
  const hasDispatched = useRef(false);

  useEffect(() => {
    if (!initialized && !hasDispatched.current) {
      hasDispatched.current = true;
      dispatch(initializeAuth());
    }
  }, [dispatch, initialized]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Spinner LoaderIcon={Loader} className="size-8" />
          <p className="text-lg text-muted-foreground">
            {initializing ? "Initializing..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
