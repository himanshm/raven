import { AUTH_FORM_CONFIGS, AUTH_FORM_FIELD_CONFIGS } from "@/constants";
import type { AuthFormData, AuthFormMode, ResetPasswordDto } from "@/types";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import AuthFormField from "./AuthFormField";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Spinner } from "./ui/spinner";

interface AuthFormProps {
  mode: AuthFormMode;
  onSubmit: (data: AuthFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  token?: string;
}

const AuthForm = ({
  mode,
  onSubmit,
  loading,
  className,
  token
}: AuthFormProps) => {
  const config = AUTH_FORM_CONFIGS[mode];
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AuthFormData>();

  const handleOnSubmit = async (data: AuthFormData) => {
    if (mode === "reset-password" && token) {
      (data as ResetPasswordDto).token = token;
    }

    await onSubmit(data);
  };

  const renderFormFields = () =>
    config.fields.map(field => {
      const fieldConfig = AUTH_FORM_FIELD_CONFIGS[field];
      return (
        <AuthFormField
          mode={mode}
          key={field}
          name={field}
          config={fieldConfig}
          register={register}
          errors={errors}
        />
      );
    });

  const renderSubmitButton = () => (
    <Button type="submit" disabled={loading} className="w-full mt-4">
      {loading ? (
        <>
          <Spinner LoaderIcon={Loader} />
          {config.submitLoadingText}...
        </>
      ) : (
        config.submitText
      )}
    </Button>
  );

  const renderFooterLink = () => {
    if (config.footerLink) {
      return (
        <div className="flex items-center">
          <p className="text-sm text-muted-foreground w-full">
            {config.footerLink.text}
            <Link
              to={config.footerLink.to}
              className="text-primary ml-1 underline-offset-4 hover:underline"
            >
              {config.footerLink.linkText}
            </Link>
          </p>
        </div>
      );
    }
  };

  return (
    <div
      className={`flex justify-center items-center h-[calc(100vh-var(--header-height))] ${className}`}
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">{config.title}</CardTitle>
          <CardDescription className="text-center">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <div className="flex flex-col gap-6">{renderFormFields()}</div>
            <CardFooter className="flex-col gap-3">
              {renderSubmitButton()}
              {renderFooterLink()}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
