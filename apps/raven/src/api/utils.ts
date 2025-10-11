import type { QueryParams } from "@/types";
import packageJson from "../../package.json";

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
