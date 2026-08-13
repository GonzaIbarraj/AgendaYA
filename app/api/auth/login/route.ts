import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth.schema";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });

      return NextResponse.json(
        {
          success: false,
          message: "Credenciales o datos del formulario inválidos",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await AuthService.loginUser(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          attempts: result.attempts,
          isBlocked: result.isBlocked,
          requiresCaptcha: result.requiresCaptcha,
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      { status: 200 }
    );

    // Guardar token JWT en cookie HTTP-Only segura
    if (result.token) {
      const maxAge = validationResult.data.rememberMe
        ? 60 * 60 * 24 * 7 // 7 días
        : 60 * 60 * 24; // 1 día

      response.cookies.set("agendaya_session", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    }

    return response;
  } catch (error) {
    console.error("Error en endpoint de login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor. Por favor, reintente más tarde.",
      },
      { status: 500 }
    );
  }
}
