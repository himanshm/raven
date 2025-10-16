import { AUTH_ENDPOINTS } from "@/api/api.routes";
import { apiGet, apiPost } from "@/api/base";
import type {
  AuthCurrentUserResponse,
  AuthLoginResponse,
  AuthRegisterResponse,
  LoginDto,
  RegisterDto
} from "@/types";

export const authService = {
  signIn: async (credentials: LoginDto) => {
    const response = await apiPost<AuthLoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    return response;
  },

  signOut: async () => {
    await apiPost(AUTH_ENDPOINTS.LOGOUT);
  },

  register: async (credentials: RegisterDto) => {
    const response = await apiPost<AuthRegisterResponse>(
      AUTH_ENDPOINTS.REGISTER,
      credentials
    );
    return response;
  },

  getCurrentUser: async () => {
    const response = await apiGet<AuthCurrentUserResponse>(
      AUTH_ENDPOINTS.CURRENT_USER
    );
    return response;
  },

  refreshToken: async () => {
    // Cookie-based refresh; no token is sent or consumed client-side
    await apiPost(AUTH_ENDPOINTS.REFRESH);
  }
};
