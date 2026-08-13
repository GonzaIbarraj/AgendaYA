import { prisma } from "../db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verificarIntentosLogin } from "../../utils/authSecurity";

const JWT_SECRET = process.env.JWT_SECRET || "agendaya-secret-key-change-in-production";

export interface RegisterInput {
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    isEmailConfirmed: boolean;
    createdAt: Date;
  };
  activationToken?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}

export interface LoginAuthResult {
  success: boolean;
  message: string;
  attempts?: number;
  isBlocked?: boolean;
  requiresCaptcha?: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    photoUrl: string | null;
    timezone: string;
    publicSlug: string | null;
  };
}

export class AuthService {
  static async registerUser(input: RegisterInput): Promise<RegisterResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // US_001 Escenario 4: Verificar si el correo ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Este correo ya está registrado. ¿Deseas iniciar sesión?",
      };
    }

    // US_001 Escenario 1 & 5: Hash bcrypt factor de costo 10
    const passwordHash = await bcrypt.hash(input.password, 10);

    // Generar token único de activación con expiración a los 60 min (US_001)
    const activationToken = `act-${crypto.randomBytes(24).toString("hex")}`;
    const activationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutos

    // Generar slug inicial a partir del email
    const baseSlug = normalizedEmail.split("@")[0].replace(/[^a-z0-9-]/g, "-");
    const publicSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        isEmailConfirmed: false, // Estado "En espera"
        activationToken,
        activationTokenExpires,
        publicSlug,
      },
    });

    return {
      success: true,
      message: "Registro completado. Por favor, revisa tu bandeja de entrada",
      user: {
        id: newUser.id,
        email: newUser.email,
        isEmailConfirmed: newUser.isEmailConfirmed,
        createdAt: newUser.createdAt,
      },
      activationToken,
    };
  }

  static async loginUser(input: LoginInput): Promise<LoginAuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Si el usuario no existe en BD
    if (!user) {
      return {
        success: false,
        message: "Usuario o contraseña incorrectos", // Mensaje genérico de seguridad (US_002)
        attempts: 1,
        isBlocked: false,
        requiresCaptcha: false,
      };
    }

    // Si el usuario está bloqueado / requiere Captcha (US_002 Escenario 3)
    if (user.failedLoginAttempts >= 5 || user.isBlocked) {
      // Si no se proporcionó captcha o el token no es válido
      if (!input.captchaToken || input.captchaToken.trim() === "") {
        return {
          success: false,
          message: "Se ha alcanzado el límite de intentos fallidos. Resuelva el desafío Captcha para continuar.",
          attempts: user.failedLoginAttempts,
          isBlocked: true,
          requiresCaptcha: true,
        };
      }
    }

    // Verificar coincidencia de contraseña
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    // Procesar las reglas de intento con utils/authSecurity.ts
    const securityResult = verificarIntentosLogin(user.failedLoginAttempts, isPasswordValid);

    // Actualizar estado del usuario en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: securityResult.attempts,
        isBlocked: securityResult.isBlocked,
        requiresCaptcha: securityResult.requiresCaptcha,
        ...(isPasswordValid ? { lastLoginAt: new Date() } : {}),
      },
    });

    if (!isPasswordValid) {
      return {
        success: false,
        message: securityResult.isBlocked
          ? "Ha alcanzado el quinto intento fallido consecutivo. Su cuenta está bloqueada temporalmente y se exige desafío Captcha."
          : "Usuario o contraseña incorrectos", // Error genérico US_002
        attempts: securityResult.attempts,
        isBlocked: securityResult.isBlocked,
        requiresCaptcha: securityResult.requiresCaptcha,
      };
    }

    // Generar Token JWT de sesión
    const expiresIn = input.rememberMe ? "7d" : "24h";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        publicSlug: user.publicSlug,
      },
      JWT_SECRET,
      { expiresIn }
    );

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
        timezone: user.timezone,
        publicSlug: user.publicSlug,
      },
    };
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        name: string | null;
        publicSlug: string | null;
      };
    } catch {
      return null;
    }
  }
}
