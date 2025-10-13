import type { ApiError, ApiResponse, QueryParams } from "@/types";
import type { AxiosError, AxiosInstance } from "axios";
import packageJson from "../../package.json";
import { AUTH_ENDPOINTS } from "./api.routes";
import apiClient from "./client";

export const buildQueryParams = (args: QueryParams): string => {
  const params = new URLSearchParams();

  Object.entries(args).forEach(([key, value]) => {
    // Skip null/undefined
    if (value === null || value === undefined) {
      return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      value.forEach(val => {
        if (val !== null && val !== undefined) {
          params.append(key, String(val));
        }
      });
    }
    // Handle nested objects
    else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== null && nestedValue !== undefined) {
          params.set(`${key}[${nestedKey}]`, String(nestedValue));
        }
      });
    }
    // Handle primitives
    else {
      params.set(key, String(value));
    }
  });

  return params.toString();
};

export const getAppVersion = () => packageJson.version;

export const getOrSetSessionId = (): string => {
  const sessionIdKey = "raven-sessionId";
  let reqSessionId = localStorage.getItem(sessionIdKey);
  if (!reqSessionId) {
    reqSessionId = crypto.randomUUID();
    localStorage.setItem(sessionIdKey, reqSessionId);
  }
  return reqSessionId;
};

// ===== BASE API CONFIGURATION =====
export const getBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_BASE_API_URL;
  if (!baseUrl) {
    throw new Error("BASE_API_URL is not defined");
  }
  return baseUrl;
};

// ===== AUTHENTICATION HELPERS =====
const AUTH_USER_KEY = "currentUserIdentifier";

export const getCurrentUserIdentifier = (): string | null => {
  return sessionStorage.getItem(AUTH_USER_KEY);
};

export const setCurrentUserIdentifier = (identifier: string): void => {
  sessionStorage.setItem(AUTH_USER_KEY, identifier);
};

export const removeCurrentUserIdentifier = (): void => {
  sessionStorage.removeItem(AUTH_USER_KEY);
};

// ===== REDIRECT HELPER =====
const redirectToLogin = (): void => {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/login?refUrl=${encodeURIComponent(currentPath)}`;
  }
};

// ===== AUTHENTICATION INTERCEPTOR =====

let isRefreshing = false;

export const setupAuthInterceptor = (client: AxiosInstance): void => {
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

      const originalRequest = error.config as typeof error.config & {
        _retry?: boolean;
      };

      // Prevent infinite loop: don't retry if already retried
      if (originalRequest?._retry) {
        return Promise.reject(error);
      }

      // Prevent infinite loop: don't retry refresh endpoint
      if (originalRequest?.url?.includes(AUTH_ENDPOINTS.REFRESH)) {
        removeCurrentUserIdentifier();
        redirectToLogin();
        return Promise.reject(error);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401 && originalRequest) {
        // Don't redirect if it's the initial current-user check (auth initialization)
        // This is expected to fail for unauthenticated users
        if (originalRequest.url?.includes(AUTH_ENDPOINTS.CURRENT_USER)) {
          return Promise.reject(error);
        }

        // Only try to refresh if we have a user identifier (meaning user was logged in)
        const hasUserIdentifier = getCurrentUserIdentifier();

        if (!hasUserIdentifier) {
          // No token exists, don't try to refresh, just redirect
          redirectToLogin();
          return Promise.reject(error);
        }

        // Prevent multiple simultaneous refresh attempts
        if (isRefreshing) {
          return Promise.reject(error);
        }

        // Mark this request as retried
        originalRequest._retry = true;
        isRefreshing = true;

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
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
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
