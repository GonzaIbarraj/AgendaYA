import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkPasswordRequirements } from "@/lib/validations/auth.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "Token de recuperación inválido" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    const reqs = checkPasswordRequirements(password || "");
    if (!reqs.minLength || !reqs.hasUppercase || !reqs.hasLowercase || !reqs.hasNumber || !reqs.hasSpecialChar) {
      return NextResponse.json(
        { success: false, message: "La nueva contraseña no cumple con los requisitos de seguridad" },
        { status: 400 }
      );
    }

    // Buscar token en BD
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || !resetToken.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Este enlace ya fue utilizado o ya no es válido. Por favor solicitá uno nuevo",
        },
        { status: 400 }
      );
    }

    // US_004 Escenario 5: Verificar expiración a los 60 minutos
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Este enlace ha expirado. Por favor solicitá uno nuevo",
        },
        { status: 400 }
      );
    }

    // Hash bcrypt factor de costo 10 (US_004 Escenario 1)
    const newPasswordHash = await bcrypt.hash(password, 10);

    // Actualizar clave del usuario e invalidar el token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash: newPasswordHash,
          failedLoginAttempts: 0,
          isBlocked: false,
          requiresCaptcha: false,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isValid: false },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en /api/auth/reset-password:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
