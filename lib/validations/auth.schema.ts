import { z } from "zod";

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio")
      .regex(emailRegex, "Formato de correo inválido. Ej: usuario@dominio.com"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(64, "La contraseña no puede superar los 64 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial (!@#$%^&*...)"),
    confirmPassword: z.string().min(1, "Debe confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .regex(emailRegex, "Formato de correo inválido. Ej: usuario@dominio.com"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  rememberMe: z.boolean().optional().default(false),
  captchaToken: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8 && password.length <= 64,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };
}
