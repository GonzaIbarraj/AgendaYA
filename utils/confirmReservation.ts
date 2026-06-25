export interface DatosReserva {
    nombreUsuario: string;
    email: string;
    profesional: string;
    evento: string;
    fecha: string;
    hora: string;
  }
  
  export interface ResultadoConfirmacion {
    estado: "CONFIRMADA" | "HORARIO_OCUPADO" | "ERROR_SERVIDOR";
    reservaRegistrada: boolean;
    idReserva?: string;
    turnoBloqueado: boolean;
    enviarCorreo: boolean;
    notificarAdministrador: boolean;
    mensaje: string;
    redirigirAlCalendario: boolean;
    reintentoHabilitado: boolean;
    datosConservados: boolean;
    datosReserva: DatosReserva;
  }
  
  function generarIdReserva(
    fecha: string,
    numeroReserva: number
  ): string {
    const fechaSinGuiones = fecha.replace(/-/g, "");
    const numeroFormateado = numeroReserva.toString().padStart(4, "0");
  
    return `RES-${fechaSinGuiones}-${numeroFormateado}`;
  }
  
  export function confirmarReserva(
    turnoDisponible: boolean,
    servidorResponde: boolean,
    datosReserva: DatosReserva,
    numeroReserva: number = 1
  ): ResultadoConfirmacion {
    if (!servidorResponde) {
      return {
        estado: "ERROR_SERVIDOR",
        reservaRegistrada: false,
        turnoBloqueado: false,
        enviarCorreo: false,
        notificarAdministrador: false,
        mensaje: "No pudimos procesar tu reserva. Intenta nuevamente",
        redirigirAlCalendario: false,
        reintentoHabilitado: true,
        datosConservados: true,
        datosReserva,
      };
    }
  
    if (!turnoDisponible) {
      return {
        estado: "HORARIO_OCUPADO",
        reservaRegistrada: false,
        turnoBloqueado: false,
        enviarCorreo: false,
        notificarAdministrador: false,
        mensaje: "Lo sentimos, este horario acaba de ser reservado",
        redirigirAlCalendario: true,
        reintentoHabilitado: false,
        datosConservados: true,
        datosReserva,
      };
    }
  
    return {
      estado: "CONFIRMADA",
      reservaRegistrada: true,
      idReserva: generarIdReserva(datosReserva.fecha, numeroReserva),
      turnoBloqueado: true,
      enviarCorreo: true,
      notificarAdministrador: true,
      mensaje: "Reserva confirmada correctamente",
      redirigirAlCalendario: false,
      reintentoHabilitado: false,
      datosConservados: true,
      datosReserva,
    };
  }