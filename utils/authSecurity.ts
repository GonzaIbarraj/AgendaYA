export interface LoginResult {
  attempts: number;
  isBlocked: boolean;
  requiresCaptcha: boolean;
}

/**
 * Procesa el resultado de un intento de inicio de sesión y aplica las reglas de la US_002.
 * @param intentosActuales Cantidad de intentos fallidos que acumulaba el usuario.
 * @param esCredencialValida Booleano que indica si la contraseña coincide.
 */
export function verificarIntentosLogin(intentosActuales: number, esCredencialValida: boolean): LoginResult {
  if (esCredencialValida) {
    return {
      attempts: 0,
      isBlocked: false,
      requiresCaptcha: false,
    };
  }

  // Si falla, sumamos 1 al contador (US_002 - Escenario 2)
  const nuevosIntentos = intentosActuales + 1;
  
  // Al quinto intento fallido consecutivo se bloquea y pide Captcha (US_002 - Escenario 3)
  const aplicarBloqueo = nuevosIntentos >= 5;

  return {
    attempts: nuevosIntentos,
    isBlocked: aplicarBloqueo,
    requiresCaptcha: aplicarBloqueo,
  };
}