// ===== API VERSION =====
const API_VERSION = import.meta.env.VITE_CURRENT_API_VERSION;

if (!API_VERSION) {
  throw new Error("CURRENT_API_VERSION is not defined");
}

// Helper to build versioned endpoints
const buildEndpoint = (path: string): string => {
  return `/api/${API_VERSION}${path}`;
};

/********************** ENDPOINTS **********************/

/********************** AUTHENTICATION ENDPOINTS **********************/

export const AUTH_ENDPOINTS = {
  LOGIN: buildEndpoint("/auth/login"),
  REGISTER: buildEndpoint("/auth/register"),
  LOGOUT: buildEndpoint("/auth/logout"),
  REFRESH: buildEndpoint("/auth/refresh-token"),
  CURRENT_USER: buildEndpoint("/auth/current-user"),
  RESET_PASSWORD: buildEndpoint("/auth/reset-password"),
  CHANGE_PASSWORD: buildEndpoint("/auth/change-password")
} as const;

/********************** USER ENDPOINTS **********************/

// ===== COMBINED ENDPOINTS (for easy import) =====
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS
} as const;

// ===== HELPER FUNCTIONS =====

// Get API version
export const getApiVersion = (): string => API_VERSION;

// Check if endpoint is auth-related (useful for skipping auth on certain routes)
export const isAuthEndpoint = (url: string): boolean => {
  return Object.values(AUTH_ENDPOINTS).some(
    endpoint => typeof endpoint === "string" && url.includes(endpoint)
  );
};

// Export individual constants for direct access
export default ENDPOINTS;
