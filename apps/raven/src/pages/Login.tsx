import AuthForm from "@/components/AuthForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearError, signIn } from "@/store/slices/authSlice";
import { isLoginDto, type AuthFormData } from "@/types";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(state => state.auth);

  // TODO: Likely to remove when toast is implemented
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (data: AuthFormData) => {
    // Since we know this is login mode, we can safely cast
    // const result = await dispatch(signIn(data as LoginDto));
    if (isLoginDto(data)) {
      const result = await dispatch(signIn(data));
      if (signIn.fulfilled.match(result)) {
        navigate("/");
      }
    }
  };

  return (
    <AuthForm
      mode="login"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default Login;
