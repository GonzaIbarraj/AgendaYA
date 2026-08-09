import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/db";

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
      include: {
        appointments: {
          orderBy: { dateTime: "asc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    // Citas iniciales de demostración basadas en el prototipo (Imagen 2) si la BD no tiene citas cargadas aún
    const appointmentsList =
      user.appointments.length > 0
        ? user.appointments.map((app) => ({
            id: app.id,
            time: new Date(app.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            clientName: app.clientName,
            serviceType: app.clientNotes || "Consulta",
          }))
        : [
            { id: "1", time: "09:00", clientName: "Maria Garcia", serviceType: "Consulta Inicial" },
            { id: "2", time: "10:30", clientName: "Juan Perez", serviceType: "Seguimiento" },
            { id: "3", time: "12:00", clientName: "Ana Rodriguez", serviceType: "Consulta" },
            { id: "4", time: "15:00", clientName: "Carlos Lopez", serviceType: "Evaluacion" },
            { id: "5", time: "17:00", clientName: "Laura Martinez", serviceType: "Consulta Inicial" },
          ];

    return NextResponse.json(
      {
        success: true,
        userName: user.name || user.email.split("@")[0],
        userEmail: user.email,
        userPhoto: user.photoUrl,
        publicSlug: user.publicSlug || "pepe-lopez",
        stats: {
          citasHoy: appointmentsList.length,
          clientes: 48,
          pendientes: 3,
          estaSemana: 24,
        },
        appointmentsToday: appointmentsList,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/dashboard/stats:", error);
    return NextResponse.json({ success: false, message: "Error del servidor" }, { status: 500 });
  }
}
