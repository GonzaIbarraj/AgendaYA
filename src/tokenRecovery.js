/**
 * Valida que un token de recuperación tenga un formato alfanumérico seguro de 32 caracteres.
 */
function validarFormatoToken(token) {
  if (!token || typeof token !== 'string') return false;
  const regexToken = /^[a-zA-Z0-9]{32}$/;
  return regexToken.test(token.trim());
}

/**
 * Determina si un token sigue vigente considerando un tiempo de vida máximo en minutos (default: 60 min).
 */
function verificarExpiracionToken(fechaCreacion, fechaActual, minutosValidez = 60) {
  const creacion = new Date(fechaCreacion);
  const actual = new Date(fechaActual);

  if (isNaN(creacion.getTime()) || isNaN(actual.getTime())) {
    throw new Error('Fecha inválida');
  }

  const diferenciaMinutos = (actual.getTime() - creacion.getTime()) / (1000 * 60);

  if (diferenciaMinutos < 0) {
    throw new Error('La fecha actual no puede ser anterior a la fecha de creación');
  }

  return diferenciaMinutos <= minutosValidez;
}

module.exports = { validarFormatoToken, verificarExpiracionToken };