import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { isRegisterDto, type AuthFormData } from "@/types";
import { useNavigate } from "react-router";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();

  const handleSubmit = async (data: AuthFormData) => {
    if (isRegisterDto(data)) {
      const result = await signUp(data);
      if (result.success) {
        navigate("/", { replace: true });
      }
    }
  };
  return (
    <AuthForm mode="register" onSubmit={handleSubmit} loading={isLoading} />
  );
};

export default Register;
