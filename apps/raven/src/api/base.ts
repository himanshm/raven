import type { ApiError, ApiResponse } from "@/types";
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import apiClient from "./client";
import { AUTH_ENDPOINTS } from "./endPoints";

// ===== BASE API CONFIGURATION =====
const getBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_BASE_API_URL;
  if (!baseUrl) {
    throw new Error("BASE_API_URL is not defined");
  }
  return baseUrl;
};

// ===== AUTHENTICATION HELPERS =====
const AUTH_USER_KEY = "currentUserIdentifier";

const getCurrentUserIdentifier = (): string | null => {
  return sessionStorage.getItem(AUTH_USER_KEY);
};

const setCurrentUserIdentifier = (identifier: string): void => {
  sessionStorage.setItem(AUTH_USER_KEY, identifier);
};

const removeCurrentUserIdentifier = (): void => {
  sessionStorage.removeItem(AUTH_USER_KEY);
};

// ===== AUTHENTICATION INTERCEPTOR =====

const setupAuthInterceptor = (client: AxiosInstance): void => {
  // Request interceptor to add auth headers
  client.interceptors.request.use(
    config => {
      const userIdentifier = getCurrentUserIdentifier();
      if (userIdentifier && config.headers) {
        config.headers.set("x-auth-user", userIdentifier); // TODO: check in the backend and verify this
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor to handle 401 errors
  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      // Skip if no reponse
      if (!error.response) return Promise.reject(error);

      const originalRequest = error.config;

      // Prevent infinite loop: don't retry refresh endpoint
      if (originalRequest?.url?.includes(AUTH_ENDPOINTS.REFRESH)) {
        removeCurrentUserIdentifier();
        redirectToLogin();
        return Promise.reject(error);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401 && originalRequest) {
        try {
          // Attempt to refresh token
          const refreshClient = apiClient(true);
          refreshClient.defaults.baseURL = getBaseUrl();

          const refreshResponse = await refreshClient.post<
            ApiResponse<{ identifier: string }>
          >(AUTH_ENDPOINTS.REFRESH);

          const newIdentifier = refreshResponse.data?.data?.identifier;

          if (newIdentifier) {
            setCurrentUserIdentifier(newIdentifier);

            // Retry original request with new identifier
            originalRequest.headers.set("x-auth-user", newIdentifier);
            return client.request(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect
          removeCurrentUserIdentifier();
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// ===== REDIRECT HELPER =====
const redirectToLogin = (): void => {
  if (typeof window !== "undefined") {
    const currentUrl = window.location.href;
    const baseUrl = getBaseUrl();
    window.location.href = `${baseUrl}/login?refUrl=${encodeURIComponent(currentUrl)}`;
  }
};

// ===== ERROR HANDLING =====
export const handleApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError.response) {
    // Server responded with error status
    return {
      message: axiosError.response.data?.message || "An unknown error occurred",
      status: axiosError.response.status,
      data: axiosError.response.data
    };
  } else if (axiosError.request) {
    // Request was made but no response received
    return {
      message: "Network error - please check your connection",
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: (error as Error).message || "An unexpected error occurred"
    };
  }
};

// ===== API CLIENT FACTORY =====

let apiInstance: AxiosInstance | null = null;

const createApiClient = (): AxiosInstance => {
  const client = apiClient(true);
  client.defaults.baseURL = getBaseUrl();
  setupAuthInterceptor(client);
  return client;
};

export const baseApi = (): AxiosInstance => {
  if (!apiInstance) {
    apiInstance = createApiClient();
  }
  return apiInstance;
};

// Reset instance (useful for testing or logout)
export const resetApiClient = (): void => {
  apiInstance = null;
};

// ===== GENERIC API METHODS =====

export const apiGet = async <T = unknown>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await baseApi().get(url, {
      params
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const apiPost = async <T = unknown>(
  url: string,
  data?: unknown,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await baseApi().post(
      url,
      data,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const apiPut = async <T = unknown>(
  url: string,
  data?: unknown,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await baseApi().put(
      url,
      data,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const apiPatch = async <T = unknown>(
  url: string,
  data?: unknown,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await baseApi().patch(
      url,
      data,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const apiDelete = async <T = unknown>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await baseApi().delete(
      url,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ===== AUTHENTICATION HELPERS =====

export const setUserIdentifier = (identifier: string): void => {
  setCurrentUserIdentifier(identifier);
};

export const clearUserIdentifier = (): void => {
  removeCurrentUserIdentifier();
};

export const getCurrentUser = (): string | null => {
  return getCurrentUserIdentifier();
};

// ===== DEFAULT EXPORT =====

export default {
  baseApi,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  setUserIdentifier,
  clearUserIdentifier,
  getCurrentUser,
  resetApiClient
};
