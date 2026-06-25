import {
  confirmarReserva,
  DatosReserva,
} from "./confirmReservation";

describe("US_0015 - Confirmación final de reserva", () => {
  const datosReserva: DatosReserva = {
    nombreUsuario: "Ana Pérez",
    email: "ana@email.com",
    profesional: "Dra. Laura Gómez",
    evento: "Consulta general",
    fecha: "2026-06-25",
    hora: "10:00",
  };

  // TEST 1: Confirmación exitosa
  test("Debe registrar la reserva con un ID único cuando el turno continúa disponible", () => {
    const resultado = confirmarReserva(
      true,
      true,
      datosReserva,
      42
    );

    expect(resultado.estado).toBe("CONFIRMADA");
    expect(resultado.reservaRegistrada).toBe(true);
    expect(resultado.idReserva).toBe("RES-20260625-0042");
    expect(resultado.idReserva).toMatch(
      /^RES-\d{8}-\d{4}$/
    );
    expect(resultado.turnoBloqueado).toBe(true);
    expect(resultado.enviarCorreo).toBe(true);
    expect(resultado.notificarAdministrador).toBe(true);
  });

  // TEST 2: Concurrencia
  test("No debe registrar la reserva cuando el horario fue tomado simultáneamente", () => {
    const resultado = confirmarReserva(
      false,
      true,
      datosReserva
    );

    expect(resultado.estado).toBe("HORARIO_OCUPADO");
    expect(resultado.reservaRegistrada).toBe(false);
    expect(resultado.idReserva).toBeUndefined();
    expect(resultado.mensaje).toBe(
      "Lo sentimos, este horario acaba de ser reservado"
    );
    expect(resultado.redirigirAlCalendario).toBe(true);
    expect(resultado.enviarCorreo).toBe(false);
    expect(resultado.notificarAdministrador).toBe(false);
  });

  // TEST 3: Error del servidor
  test("No debe generar una reserva parcial cuando el servidor no responde", () => {
    const resultado = confirmarReserva(
      true,
      false,
      datosReserva
    );

    expect(resultado.estado).toBe("ERROR_SERVIDOR");
    expect(resultado.reservaRegistrada).toBe(false);
    expect(resultado.idReserva).toBeUndefined();
    expect(resultado.mensaje).toBe(
      "No pudimos procesar tu reserva. Intenta nuevamente"
    );
    expect(resultado.reintentoHabilitado).toBe(true);
    expect(resultado.datosConservados).toBe(true);
    expect(resultado.datosReserva).toEqual(datosReserva);
    expect(resultado.enviarCorreo).toBe(false);
  });
});