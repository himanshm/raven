// Auth form configurations
import type {
  AuthFormConfig,
  AuthFormFieldConfig,
  AuthFormMode
} from "@/types";
// Validate required environment variables
if (!import.meta.env.VITE_BASE_API_URL) {
  throw new Error("BASE_API_URL is not defined");
}

if (!import.meta.env.VITE_EMAIL_VALIDATION_REGEX) {
  throw new Error("EMAIL_VALIDATION_REGEX is not defined");
}

export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_BASE_API_URL,
  EMAIL_VALIDATION_REGEX: import.meta.env.VITE_EMAIL_VALIDATION_REGEX,
  PASSWORD_MIN_LENGTH: 6,
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
} as const;

export const FEATURE_FLAGS = {
  ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA === "true",
  ENABLE_SOCIAL_LOGIN: import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === "true",
  ENABLE_PASSWORD_RESET: true
} as const;

export const VALIDATION_RULES = {
  EMAIL: APP_CONFIG.EMAIL_VALIDATION_REGEX,
  PASSWORD: {
    MIN_LENGTH: APP_CONFIG.PASSWORD_MIN_LENGTH,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true
  }
} as const;

export const AUTH_FORM_FIELD_CONFIGS: Record<string, AuthFormFieldConfig> = {
  name: {
    label: "Name",
    type: "text",
    autoComplete: "name",
    validation: {
      required: "Name is required",
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters long"
      }
    }
  },
  email: {
    label: "Email",
    type: "email",
    autoComplete: "email",
    validation: {
      required: "Email is required",
      pattern: {
        value: VALIDATION_RULES.EMAIL,
        message: "Invalid email address"
      }
    }
  },
  password: {
    label: "Password",
    type: "password",
    autoComplete: "current-password",
    validation: {
      required: "Password is required",
      minLength: {
        value: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`
      }
    }
  },
  confirmPassword: {
    label: "Confirm Password",
    type: "password",
    autoComplete: "new-password",
    validation: {
      required: "Please confirm your password",
      validate: (value: string, formValues: Record<string, unknown>) =>
        value === formValues.password || "Passwords do not match"
    }
  },
  currentPassword: {
    label: "Current Password",
    type: "password",
    autoComplete: "current-password",
    validation: {
      required: "Current password is required"
    }
  },
  newPassword: {
    label: "New Password",
    type: "password",
    autoComplete: "new-password",
    validation: {
      required: "New password is required",
      minLength: {
        value: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`
      }
    }
  }
} as const;

export const AUTH_FORM_CONFIGS: Record<AuthFormMode, AuthFormConfig> = {
  login: {
    title: "Login",
    description: "Enter your email and password to login",
    fields: ["email", "password"],
    submitText: "Login",
    submitLoadingText: "Logging In...",
    footerLink: {
      text: "Don't have an account?",
      linkText: "Sign Up",
      to: "/register"
    },
    forgotPassword: true
  },
  register: {
    title: "Register",
    description: "Create your account",
    fields: ["name", "email", "password", "confirmPassword"],
    submitText: "Sign Up",
    submitLoadingText: "Signing Up...",
    footerLink: {
      text: "Already have an account?",
      linkText: "Login",
      to: "/login"
    }
  },
  "forgot-password": {
    title: "Forgot Password",
    description: "Enter your email to reset your password",
    fields: ["email"],
    submitText: "Send Reset Link",
    submitLoadingText: "Sending Reset Link...",
    footerLink: {
      text: "Remember your password?",
      linkText: "Back to Login",
      to: "/login"
    }
  },
  "reset-password": {
    title: "Reset Password",
    description: "Enter your new password",
    fields: ["password", "confirmPassword"],
    submitText: "Reset Password",
    submitLoadingText: "Resetting Password..."
  },
  "change-password": {
    title: "Change Password",
    description: "Enter your current and new password",
    fields: ["currentPassword", "newPassword", "confirmPassword"],
    submitText: "Change Password",
    submitLoadingText: "Changing Password..."
  }
} as const;
