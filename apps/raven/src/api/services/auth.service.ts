import { AUTH_ENDPOINTS } from "@/api/api.routes";
import {
  apiGet,
  apiPost,
  clearUserIdentifier,
  setUserIdentifier
} from "@/api/base";
import type { LoginDto, RegisterDto, User } from "@/types";

export const authService = {
  signIn: async (credentials: LoginDto) => {
    // TODO: add return type
    // TODO: check if 'x-auth-user' header is set in backend
    const response = await apiPost<{ user: User; token: string }>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    if (response.data.token) {
      setUserIdentifier(response.data.token);
    }

    return response.data;
  },

  signOut: async () => {
    await apiPost(AUTH_ENDPOINTS.LOGOUT);
    clearUserIdentifier();
  },

  register: async (credentials: RegisterDto) => {
    const response = await apiPost<{ user: User; token: string }>(
      AUTH_ENDPOINTS.REGISTER,
      credentials
    );

    if (response.data.token) {
      setUserIdentifier(response.data.token);
    }

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiGet<User>(AUTH_ENDPOINTS.CURRENT_USER);
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiPost<{ token: string }>(AUTH_ENDPOINTS.REFRESH);

    if (response.data.token) {
      setUserIdentifier(response.data.token);
    }

    return response.data;
  }
};
