/**
 * Lógica pura de negocio desacoplada de la interfaz para el Módulo 4 (Proceso de Reserva - Booking Público).
 */

/**
 * Valida el nombre completo de un usuario invitado.
 * @param {string} nombre 
 * @returns {{ valido: boolean, error: string | null }}
 */
function validarNombreInvitado(nombre) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return { valido: false, error: 'El nombre es obligatorio' };
  }

  const nombreLimpio = nombre.trim();

  if (nombreLimpio.length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (nombreLimpio.length > 80) {
    return { valido: false, error: 'El nombre no puede superar los 80 caracteres' };
  }

  return { valido: true, error: null };
}

/**
 * Genera el identificador único de reserva con formato RES-YYYYMMDD-XXXX.
 * @param {string} fecha Formato YYYY-MM-DD
 * @param {number} numeroReserva 
 * @returns {string}
 */
function generarIdReserva(fecha, numeroReserva) {
  if (!fecha || typeof fecha !== 'string') {
    fecha = '20260428';
  }
  const fechaSinGuiones = fecha.replace(/-/g, '');
  const numeroFormateado = (numeroReserva || 1).toString().padStart(4, '0');
  return `RES-${fechaSinGuiones}-${numeroFormateado}`;
}

/**
 * Procesa la confirmación de una reserva según el estado del turno y la respuesta del servidor.
 * @param {boolean} turnoDisponible 
 * @param {boolean} servidorResponde 
 * @param {Object} datosReserva 
 * @param {number} [numeroReserva=1] 
 * @returns {Object}
 */
function confirmarReserva(turnoDisponible, servidorResponde, datosReserva, numeroReserva = 1) {
  if (!servidorResponde) {
    return {
      estado: 'ERROR_SERVIDOR',
      reservaRegistrada: false,
      turnoBloqueado: false,
      enviarCorreo: false,
      notificarAdministrador: false,
      mensaje: 'No pudimos procesar tu reserva. Intenta nuevamente',
      redirigirAlCalendario: false,
      reintentoHabilitado: true,
      datosConservados: true,
      datosReserva,
    };
  }

  if (!turnoDisponible) {
    return {
      estado: 'HORARIO_OCUPADO',
      reservaRegistrada: false,
      turnoBloqueado: false,
      enviarCorreo: false,
      notificarAdministrador: false,
      mensaje: 'Lo sentimos, este horario acaba de ser reservado',
      redirigirAlCalendario: true,
      reintentoHabilitado: false,
      datosConservados: true,
      datosReserva,
    };
  }

  return {
    estado: 'CONFIRMADA',
    reservaRegistrada: true,
    idReserva: generarIdReserva(datosReserva ? datosReserva.fecha : '2026-04-28', numeroReserva),
    turnoBloqueado: true,
    enviarCorreo: true,
    notificarAdministrador: true,
    mensaje: 'Reserva confirmada correctamente',
    redirigirAlCalendario: false,
    reintentoHabilitado: false,
    datosConservados: true,
    datosReserva,
  };
}

module.exports = {
  validarNombreInvitado,
  generarIdReserva,
  confirmarReserva,
};
