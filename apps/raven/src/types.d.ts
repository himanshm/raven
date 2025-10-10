export type Theme = "dark" | "light" | "system";

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean | null | undefined)[];

export type QueryParams = Record<string, QueryValue>;

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

export interface ApiResult<T> {
  data: ApiResponse<T>;
  status: number;
  headers: Record<string, string>;
}
