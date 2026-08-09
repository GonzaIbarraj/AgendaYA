import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/db";
import { validarNombreProfesional } from "@/utils/professionalName";
import { validateEmail } from "@/utils/emailValidation";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("agendaya_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        timezone: true,
        publicSlug: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/profile:", error);
    return NextResponse.json({ success: false, message: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("agendaya_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, timezone, publicSlug, photoUrl } = body;

    // US_005: Validación de Nombre Profesional
    if (name !== undefined) {
      const nameValidation = validarNombreProfesional(name);
      if (!nameValidation.valido) {
        return NextResponse.json(
          { success: false, message: nameValidation.error || "Nombre inválido" },
          { status: 400 }
        );
      }
    }

    // US_006: Validación de Email
    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return NextResponse.json(
          { success: false, message: emailValidation.message },
          { status: 400 }
        );
      }

      // Comprobar si el nuevo email ya está en uso por otro usuario
      const existingEmail = await prisma.user.findFirst({
        where: { email: email.trim().toLowerCase(), NOT: { id: decoded.id } },
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: "El correo electrónico ya se encuentra registrado" },
          { status: 400 }
        );
      }
    }

    // M01-R06F: Validación de Enlace Público Slug
    if (publicSlug !== undefined) {
      const slugRegex = /^[a-z0-9-]+$/;
      const normalizedSlug = publicSlug.trim().toLowerCase();
      if (!slugRegex.test(normalizedSlug)) {
        return NextResponse.json(
          { success: false, message: "El enlace solo puede contener letras minúsculas, números y guiones" },
          { status: 400 }
        );
      }

      const existingSlug = await prisma.user.findFirst({
        where: { publicSlug: normalizedSlug, NOT: { id: decoded.id } },
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, message: "Este enlace ya está siendo utilizado por otro profesional" },
          { status: 400 }
        );
      }
    }

    // Actualizar registro del usuario
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}),
        ...(timezone !== undefined ? { timezone } : {}),
        ...(publicSlug !== undefined ? { publicSlug: publicSlug.trim().toLowerCase() } : {}),
        ...(photoUrl !== undefined ? { photoUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        timezone: true,
        publicSlug: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Perfil actualizado correctamente",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en PUT /api/profile:", error);
    return NextResponse.json({ success: false, message: "Error al actualizar perfil" }, { status: 500 });
  }
}
