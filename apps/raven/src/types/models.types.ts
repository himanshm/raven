// Domain/Server models
export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}

// DTOs (Data Transfer Objects) for API requests
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}
