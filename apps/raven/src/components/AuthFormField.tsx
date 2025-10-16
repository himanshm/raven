import type { AuthFormData, AuthFormFieldConfig, AuthFormMode } from "@/types";
import type { FieldError, FieldErrors, UseFormRegister } from "react-hook-form";
import { Link } from "react-router";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AuthFormFieldProps {
  mode: AuthFormMode;
  name: string;
  config: AuthFormFieldConfig;
  register: UseFormRegister<AuthFormData>;
  errors: FieldErrors<AuthFormData>;
}

const AuthFormField = ({
  mode,
  name,
  config,
  register,
  errors
}: AuthFormFieldProps) => {
  const renderFormLabel = () => {
    if (name === "password" && mode === "login") {
      return (
        <div className="flex items-center">
          <Label htmlFor={name}>{config.label}</Label>
          <Link
            to="/forgot-password"
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      );
    }

    return <Label htmlFor={name}>{config.label}</Label>;
  };

  // const typedErrors = errors as Record<string, FieldError>; // more permissive and less typesafe
  const fieldError = errors[name as keyof typeof errors]; // more restrictive and type-safe

  return (
    <div className="grid gap-2">
      {renderFormLabel()}
      <Input
        id={name}
        type={config.type}
        autoComplete={config.autoComplete}
        {...register(
          name as keyof AuthFormData,
          config.validation as Record<string, unknown>
        )}
      />
      {fieldError && (
        <p className="text-destructive text-sm mt-1">
          {(fieldError as FieldError)?.message}
        </p>
      )}
    </div>
  );
};

export default AuthFormField;
