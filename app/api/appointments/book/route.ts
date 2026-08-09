import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confirmarReserva, DatosReserva } from "@/utils/confirmReservation";
import { validarNombre } from "@/utils/validarNombre";
import { validateEmail } from "@/utils/emailValidation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slug,
      eventTypeId,
      eventTitle,
      date, // YYYY-MM-DD
      time, // HH:MM
      clientName,
      clientEmail,
      clientPhone,
      clientNotes,
      professionalName,
    } = body;

    // US_013: Validación de Nombre del Invitado
    const nameValidation = validarNombre(clientName || "");
    if (!nameValidation.valido) {
      return NextResponse.json(
        { success: false, message: nameValidation.error || "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    // US_014: Validación de Email del Invitado
    const emailValidation = validateEmail(clientEmail || "");
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, message: emailValidation.message },
        { status: 400 }
      );
    }

    const datosReserva: DatosReserva = {
      nombreUsuario: clientName.trim(),
      email: clientEmail.trim().toLowerCase(),
      profesional: professionalName || "Dra. Maria Garcia",
      evento: eventTitle || "Consulta",
      fecha: date,
      hora: time,
    };

    // Verificar si el horario ya está reservado (Prevención de Solapamiento / Concurrencia - US_015 / M04-RN03)
    const startDateTime = new Date(`${date}T${time}:00`);

    // Buscar si ya existe una cita en la BD para ese profesional a esa misma hora
    let user = await prisma.user.findFirst({
      where: { publicSlug: slug ? slug.trim().toLowerCase() : "pepe-lopez" },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    let isSlotAvailable = true;
    if (user) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          userId: user.id,
          dateTime: startDateTime,
          status: "CONFIRMADA",
        },
      });
      if (existingAppointment) {
        isSlotAvailable = false;
      }
    }

    // Procesar con la lógica del negocio de confirmación (confirmarReserva)
    const numeroConsecutivo = Math.floor(1000 + Math.random() * 9000);
    const resultado = confirmarReserva(isSlotAvailable, true, datosReserva, numeroConsecutivo);

    if (resultado.estado !== "CONFIRMADA") {
      return NextResponse.json(
        {
          success: false,
          estado: resultado.estado,
          message: resultado.mensaje,
          redirigirAlCalendario: resultado.redirigirAlCalendario,
          reintentoHabilitado: resultado.reintentoHabilitado,
          datosConservados: resultado.datosConservados,
        },
        { status: 400 }
      );
    }

    // Si el turno está disponible, persistir en BD si tenemos un usuario válido
    if (user) {
      let eventType = await prisma.eventType.findFirst({
        where: { userId: user.id },
      });

      if (!eventType) {
        eventType = await prisma.eventType.create({
          data: {
            userId: user.id,
            title: eventTitle || "Consulta",
            durationMinutes: 50,
          },
        });
      }

      await prisma.appointment.create({
        data: {
          id: resultado.idReserva || `RES-${date.replace(/-/g, "")}-${numeroConsecutivo}`,
          userId: user.id,
          eventTypeId: eventType.id,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim().toLowerCase(),
          clientPhone: clientPhone ? clientPhone.trim() : null,
          clientNotes: clientNotes ? clientNotes.trim() : null,
          dateTime: startDateTime,
          status: "CONFIRMADA",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        idReserva: resultado.idReserva,
        mensaje: resultado.mensaje,
        datosReserva: resultado.datosReserva,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/appointments/book:", error);

    const fallbackDatos: DatosReserva = {
      nombreUsuario: "Invitado",
      email: "invitado@ejemplo.com",
      profesional: "Profesional",
      evento: "Consulta",
      fecha: new Date().toISOString().split("T")[0],
      hora: "10:00",
    };

    const resultadoError = confirmarReserva(true, false, fallbackDatos);
    return NextResponse.json(
      {
        success: false,
        estado: resultadoError.estado,
        message: resultadoError.mensaje,
        reintentoHabilitado: true,
        datosConservados: true,
      },
      { status: 500 }
    );
  }
}
