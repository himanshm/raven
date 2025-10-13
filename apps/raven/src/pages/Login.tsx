import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { EMAIL_VALIDATION_REGEX } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearError, signIn } from "@/store/slices/authSlice";
import type { LoginDto } from "@/types";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginDto>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: LoginDto) => {
    const result = await dispatch(signIn(data));

    if (signIn.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-var(--header-height))]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_VALIDATION_REGEX,
                      message: "Invalid email address"
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long"
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm text-center my-1">
                {error}
              </p>
            )}
            <CardFooter className="flex-col gap-3">
              <Button type="submit" disabled={loading} className="w-full mt-4">
                {loading ? (
                  <>
                    <Spinner LoaderIcon={Loader} />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground w-full">
                  Don't have an account?
                  <Link
                    to="/register"
                    className="text-primary ml-1 underline-offset-4 hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
