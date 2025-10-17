// API types

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean | null | undefined)[];

export type QueryParams = Record<string, QueryValue>;

interface ApiMeta {
  success: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  meta: ApiMeta;
}

export interface ApiError {
  message: string;
  success: boolean;
  status?: number;
  data?: unknown;
}
