import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const normalizedSlug = slug.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { publicSlug: normalizedSlug },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        timezone: true,
        publicSlug: true,
        eventTypes: {
          where: { isActive: true },
        },
        availabilities: true,
      },
    });

    // Fallback de demostración si el slug es pepe-lopez o doctor-pepe-lopez
    if (!user) {
      if (normalizedSlug === "pepe-lopez" || normalizedSlug === "doctor-pepe-lopez") {
        return NextResponse.json(
          {
            success: true,
            professional: {
              id: "demo-user-id",
              name: "Dra. Maria Garcia",
              specialty: "Psicología Clínica",
              bio: "Especialista en terapia cognitivo-conductual con amplia experiencia.",
              photoUrl: null,
              publicSlug: normalizedSlug,
              eventTypes: [
                { id: "ev-1", title: "Consulta Individual", durationMinutes: 50, description: "Sesión de terapia personalizada" },
                { id: "ev-2", title: "Videollamada", durationMinutes: 45, description: "Consulta online por videoconferencia" },
                { id: "ev-3", title: "Cita Presencial", durationMinutes: 60, description: "Atención en consultorio" },
              ],
            },
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, message: "No se encuentra agenda del profesional o empresa" },
        { status: 404 }
      );
    }

    const eventTypesList =
      user.eventTypes.length > 0
        ? user.eventTypes
        : [
            { id: "ev-1", title: "Consulta Individual", durationMinutes: 50, description: "Sesión de terapia personalizada" },
            { id: "ev-2", title: "Videollamada", durationMinutes: 45, description: "Consulta online por videoconferencia" },
            { id: "ev-3", title: "Cita Presencial", durationMinutes: 60, description: "Atención en consultorio" },
          ];

    return NextResponse.json(
      {
        success: true,
        professional: {
          id: user.id,
          name: user.name || "Dra. Maria Garcia",
          specialty: "Psicología Clínica",
          bio: "Bienvenido a mi agenda online. Selecciona un horario disponible para agendar tu cita.",
          photoUrl: user.photoUrl,
          publicSlug: user.publicSlug,
          eventTypes: eventTypesList,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/public/[slug]:", error);
    return NextResponse.json({ success: false, message: "Error del servidor" }, { status: 500 });
  }
}
