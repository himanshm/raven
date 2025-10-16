import { APP_CONFIG } from "@/constants";
import type { ApiError, QueryParams } from "@/types";
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
  const baseUrl = APP_CONFIG.API_BASE_URL;
  return baseUrl;
};

// ===== REDIRECT HELPER =====
const redirectToLogin = (): void => {
  window.dispatchEvent(new CustomEvent("auth:logout"));
};

// ===== AUTHENTICATION INTERCEPTOR =====

let isRefreshing = false;

export const setupAuthInterceptor = (client: AxiosInstance): void => {
  // Request interceptor to add auth headers
  client.interceptors.request.use(
    config => config,
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor to handle 401 errors
  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      // Skip if no response
      if (!error.response) return Promise.reject(error);

      const originalRequest = error.config as typeof error.config & {
        _retry?: boolean;
      };

      // Only handle 401 errors
      if (error.response.status !== 401) {
        return Promise.reject(error);
      }

      // Don't retry if already retried
      if (originalRequest?._retry) {
        return Promise.reject(error);
      }

      // Special handling for current-user endpoint (initial session check)
      // Let it fail silently so the app can show login page without errors
      if (
        originalRequest?.url?.includes(AUTH_ENDPOINTS.CURRENT_USER) &&
        !isRefreshing
      ) {
        return Promise.reject(error);
      }

      // Don't retry refresh endpoint itself
      if (originalRequest?.url?.includes(AUTH_ENDPOINTS.REFRESH)) {
        redirectToLogin();
        return Promise.reject(error);
      }

      // If already refreshing, do not queue or retry here
      if (isRefreshing) {
        return Promise.reject(error);
      }

      // Mark as retrying and start refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Create a fresh client for refresh request
        const refreshClient = apiClient(true);
        refreshClient.defaults.baseURL = getBaseUrl();

        // Attempt to refresh token (cookies handle auth; response body not required)
        await refreshClient.post(AUTH_ENDPOINTS.REFRESH);

        // Retry original request as-is (no custom headers)
        return client.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
