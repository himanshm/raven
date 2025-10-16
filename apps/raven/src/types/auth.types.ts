import type { User } from ".";

export interface AuthLoginResponse {
  user: User;
}

export interface AuthRegisterResponse {
  user: User;
}

export interface AuthCurrentUserResponse {
  user: User;
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

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type AuthFormData =
  | LoginDto
  | RegisterDto
  | ForgotPasswordDto
  | ResetPasswordDto
  | ChangePasswordDto;

export type AuthFormMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "change-password";

export interface AuthFormConfig {
  title: string;
  description: string;
  fields: readonly string[];
  submitText: string;
  submitLoadingText?: string;
  footerLink?: {
    text: string;
    linkText: string;
    to: string;
  };
  forgotPassword?: boolean;
}

export interface AuthFormFieldConfig {
  label: string;
  type: string;
  autoComplete: string;
  validation: {
    required?: string;
    minLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (
      value: string,
      formValues: Record<string, unknown>
    ) => boolean | string;
  };
}

// Type Guards for AuthFormData
export const isLoginDto = (data: unknown): data is LoginDto => {
  return (
    typeof data === "object" &&
    data !== null &&
    "email" in data &&
    "password" in data &&
    typeof (data as Record<string, unknown>).email === "string" &&
    typeof (data as Record<string, unknown>).password === "string" &&
    !("name" in data)
  );
};

export const isRegisterDto = (data: unknown): data is RegisterDto => {
  return (
    typeof data === "object" &&
    data !== null &&
    "email" in data &&
    "password" in data &&
    "name" in data &&
    typeof (data as Record<string, unknown>).email === "string" &&
    typeof (data as Record<string, unknown>).password === "string" &&
    typeof (data as Record<string, unknown>).name === "string"
  );
};

export const isForgotPasswordDto = (
  data: unknown
): data is ForgotPasswordDto => {
  return (
    typeof data === "object" &&
    data !== null &&
    "email" in data &&
    typeof (data as Record<string, unknown>).email === "string" &&
    !("password" in data)
  );
};

export const isResetPasswordDto = (data: unknown): data is ResetPasswordDto => {
  return (
    typeof data === "object" &&
    data !== null &&
    "token" in data &&
    "password" in data &&
    "confirmPassword" in data &&
    typeof (data as Record<string, unknown>).token === "string" &&
    typeof (data as Record<string, unknown>).password === "string" &&
    typeof (data as Record<string, unknown>).confirmPassword === "string"
  );
};

export const isChangePasswordDto = (
  data: unknown
): data is ChangePasswordDto => {
  return (
    typeof data === "object" &&
    data !== null &&
    "currentPassword" in data &&
    "newPassword" in data &&
    "confirmNewPassword" in data &&
    typeof (data as Record<string, unknown>).currentPassword === "string" &&
    typeof (data as Record<string, unknown>).newPassword === "string" &&
    typeof (data as Record<string, unknown>).confirmNewPassword === "string"
  );
};

export const isAuthFormData = (data: unknown): data is AuthFormData => {
  return (
    isLoginDto(data) ||
    isRegisterDto(data) ||
    isForgotPasswordDto(data) ||
    isResetPasswordDto(data) ||
    isChangePasswordDto(data)
  );
};
