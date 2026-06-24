export interface RecoveryToken {
  tokenString: string;
  email: string;
  expiresAt: number; // Timestamp en milisegundos
  isValid: boolean;  // Estado de validez lógica (ej. si fue reemplazado por uno nuevo)
}

export interface RecoveryResponse {
  mensajeUI: string;
  nuevoToken: RecoveryToken | null;
  tokensActualizados: RecoveryToken[];
}

/**
 * Procesa la solicitud de recuperación siguiendo el Escenario 1, 2 y 3.
 * @param email Correo ingresado por el usuario.
 * @param isRegistrado Booleano que simula si el mail existe en la BD.
 * @param tokensPrevios Lista de tokens que ya tenía el usuario.
 * @param currentTime Timestamp actual inyectado para facilitar el testing.
 */
export function procesarSolicitudRecuperacion(
  email: string, 
  isRegistrado: boolean, 
  tokensPrevios: RecoveryToken[],
  currentTime: number
): RecoveryResponse {
  
  // Escenario 3: Invalidar todos los tokens anteriores válidos de este usuario
  const tokensActualizados = tokensPrevios.map(t => {
    if (t.email === email && t.isValid) {
      return { ...t, isValid: false };
    }
    return t;
  });

  let nuevoToken: RecoveryToken | null = null;
  
  // Mensaje neutro por seguridad (Escenario 1 y sugerido por PO)
  const mensajeUI = "Si ese correo está registrado, recibirás un enlace en los próximos minutos";

  if (isRegistrado) {
    // Escenario 1: Generar token con 60 min de validez
    nuevoToken = {
      tokenString: `token-${Math.random().toString(36).substring(2)}`,
      email: email,
      expiresAt: currentTime + (60 * 60 * 1000), // + 60 minutos
      isValid: true
    };
    tokensActualizados.push(nuevoToken);
  }

  return {
    mensajeUI,
    nuevoToken,
    tokensActualizados
  };
}

/**
 * Verifica si el token es apto para usarse (Escenario 3 y 5)
 * @param token Objeto del token a validar.
 * @param currentTime Timestamp del momento en que el usuario hace clic en el enlace.
 */
export function verificarValidezToken(token: RecoveryToken, currentTime: number): { valido: boolean, error?: string } {
  // Escenario 3: Fue invalidado porque se pidió otro después
  if (!token.isValid) {
    return { 
      valido: false, 
      error: 'Este enlace ya no es válido. Por favor solicitá uno nuevo' 
    };
  }
  
  // Escenario 5: Pasaron más de 60 minutos
  if (currentTime > token.expiresAt) {
    return { 
      valido: false, 
      error: 'Este enlace ha expirado. Por favor solicitá uno nuevo' 
    };
  }
  
  return { valido: true };
}