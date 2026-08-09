import { NextResponse } from "next/server";
import { validateEmail } from "@/utils/emailValidation";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    const emailValidation = validateEmail(email || "");
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, message: emailValidation.message },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Mensaje neutro por seguridad (US_003 Escenario 1 & PO)
    const neutralMessage = "Si ese correo está registrado, recibirás un enlace en los próximos minutos";

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Retornar mensaje neutro sin revelar existencia de cuenta
      return NextResponse.json(
        {
          success: true,
          message: neutralMessage,
        },
        { status: 200 }
      );
    }

    // US_003 Escenario 3: Invalidar todos los tokens de recuperación anteriores del usuario
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isValid: true },
      data: { isValid: false },
    });

    // Generar nuevo token con expiración a los 60 minutos
    const resetTokenString = `reset-${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutos

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetTokenString,
        expiresAt,
        isValid: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: neutralMessage,
        token: resetTokenString, // Para pruebas en entorno local / demo
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en /api/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
