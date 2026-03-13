import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router";

const loginSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(30, "El usuario no puede superar 30 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await api.login({
        username: data.username,
        password: data.password,
      });
      login(response.tokens.accessToken, response.user, response.tokens.refreshToken);
      toast.success("¡Bienvenido de vuelta!");
      navigate("/chat");
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Usuario</label>
        <Input
          {...register("username")}
          placeholder="Ej: josedev"
          error={errors.username?.message}
          autoComplete="username"
        />
        {errors.username && (
          <p className="text-xs text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Contraseña</label>
        <Input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Conectando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
