import type { ApiResponse } from "@/types";
import type { AxiosInstance, AxiosResponse } from "axios";
import apiClient from "./client";
import {
  getBaseUrl,
  getCurrentUserIdentifier,
  handleApiError,
  removeCurrentUserIdentifier,
  setCurrentUserIdentifier,
  setupAuthInterceptor
} from "./utils";

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
