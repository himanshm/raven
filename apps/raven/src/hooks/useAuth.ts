import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAuth,
  clearError,
  getCurrentUser,
  register,
  signIn,
  signOut
} from "@/store/slices/authSlice";
import type { LoginDto, RegisterDto } from "@/types";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector(state => state.auth);

  // Listen for automatic logout events (from token refresh failures)
  useEffect(() => {
    const handleAutoLogout = () => {
      dispatch(clearAuth());
      toast.error("Session expired. Please sign in again.");
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:logout", handleAutoLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAutoLogout);
    };
  }, [dispatch, navigate]);

  const signUp = useCallback(
    async (credentials: RegisterDto) => {
      const result = await dispatch(register(credentials));

      if (register.fulfilled.match(result)) {
        toast.success(result.payload.message);
        return { success: result.payload.success, data: result.payload };
      }

      if (register.rejected.match(result)) {
        const error = result.payload?.message || "Registration failed";
        toast.error(error);
        return { success: false, error };
      }

      return { success: false, error: "Unknown error occurred" };
    },
    [dispatch]
  );

  const login = useCallback(
    async (credentials: LoginDto) => {
      const result = await dispatch(signIn(credentials));

      if (signIn.fulfilled.match(result)) {
        toast.success(result.payload.message);
        return { success: true, data: result.payload };
      }

      if (signIn.rejected.match(result)) {
        const error = result.payload?.message || "Sign in failed";
        toast.error(error);
        return { success: false, error };
      }

      return { success: false, error: "Unknown error occurred" };
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    const result = await dispatch(signOut());

    if (signOut.fulfilled.match(result)) {
      toast.success("Signed out successfully");
      navigate("/login", { replace: true });
      return { success: true };
    }

    // Even if API fails, clear local state
    dispatch(clearAuth());
    navigate("/login", { replace: true });
    return { success: true };
  }, [dispatch, navigate]);

  const checkSession = useCallback(async () => {
    const result = await dispatch(getCurrentUser());

    if (getCurrentUser.fulfilled.match(result)) {
      return { success: true, data: result.payload };
    }

    return { success: false, error: "No active session" };
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.loading,
    error: auth.error,
    initialized: auth.initialized,

    // Actions
    login,
    logout,
    signUp,
    checkSession,
    clearError: clearAuthError
  };
};
