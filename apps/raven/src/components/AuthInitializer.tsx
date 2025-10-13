import { useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import { useEffect, useRef, type ReactNode } from "react";

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      dispatch(getCurrentUser());
      hasInitialized.current = true;
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
