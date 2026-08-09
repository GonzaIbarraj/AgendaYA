import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth.schema";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar esquema Zod
    const validationResult = registerSchema.safeParse(body);
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

    const { email, password } = validationResult.data;
    const result = await AuthService.registerUser({ email, password });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
        activationToken: result.activationToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en endpoint de registro:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor. Por favor, reintente más tarde.",
      },
      { status: 500 }
    );
  }
}
