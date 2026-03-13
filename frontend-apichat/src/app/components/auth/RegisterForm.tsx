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

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(30, "El usuario no puede superar 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, numeros y guion bajo (_)"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayuscula")
    .regex(/[a-z]/, "Debe incluir al menos una minuscula")
    .regex(/[0-9]/, "Debe incluir al menos un numero")
    .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un simbolo"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await api.register({
        username: data.username,
        password: data.password,
      });
      login(response.tokens.accessToken, response.user, response.tokens.refreshToken);
      toast.success("¡Cuenta creada exitosamente!");
      navigate("/chat");
    } catch (err: any) {
      toast.error(err.message || "Error al registrarse");
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
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Confirmar Contraseña</label>
        <Input
          {...register("confirmPassword")}
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear Cuenta"}
      </Button>
    </form>
  );
}
