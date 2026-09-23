/**
 * Lógica pura de negocio desacoplada de la interfaz para el Módulo 1 (Autenticación y Perfil).
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida el formato de un correo electrónico.
 * @param {string} email 
 * @returns {boolean}
 */
function validarEmail(email) {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return false;
  }
  return emailRegex.test(email.trim());
}

/**
 * Valida los requisitos de seguridad de una contraseña y la coincidencia con su confirmación.
 * Requisitos: Entre 8 y 64 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {{ valido: boolean, error: string | null }}
 */
function validarPassword(password, confirmPassword) {
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return { valido: false, error: 'La contraseña es obligatoria' };
  }

  if (password !== confirmPassword) {
    return { valido: false, error: 'Las contraseñas no coinciden' };
  }

  if (password.length < 8 || password.length > 64) {
    return { valido: false, error: 'La contraseña debe tener entre 8 y 64 caracteres' };
  }

  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneMinuscula = /[a-z]/.test(password);
  const tieneNumero = /[0-9]/.test(password);
  const tieneEspecial = /[^A-Za-z0-9]/.test(password);

  if (!tieneMayuscula || !tieneMinuscula || !tieneNumero || !tieneEspecial) {
    return {
      valido: false,
      error: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    };
  }

  return { valido: true, error: null };
}

/**
 * Evalúa los intentos de inicio de sesión y aplica la regla de bloqueo al 5to intento fallido.
 * @param {number} intentosActuales 
 * @param {boolean} esCredencialValida 
 * @returns {{ attempts: number, isBlocked: boolean, requiresCaptcha: boolean }}
 */
function evaluarIntentosLogin(intentosActuales, esCredencialValida) {
  if (esCredencialValida) {
    return {
      attempts: 0,
      isBlocked: false,
      requiresCaptcha: false,
    };
  }

  const nuevosIntentos = (intentosActuales || 0) + 1;
  const bloquear = nuevosIntentos >= 5;

  return {
    attempts: nuevosIntentos,
    isBlocked: bloquear,
    requiresCaptcha: bloquear,
  };
}

module.exports = {
  validarEmail,
  validarPassword,
  evaluarIntentosLogin,
};
