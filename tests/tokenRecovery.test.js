const { validarFormatoToken, verificarExpiracionToken } = require('../src/tokenRecovery');

describe('Pruebas Unitarias M01 - Seguridad de Tokens de Recuperación (Tarea C - Gonzalo Ibarra)', () => {

  // ==========================================================================
  // FUNCIÓN 1: validarFormatoToken (Historia de Usuario: US_003)
  // ==========================================================================

  // TEST 1: Caso Normal
  it('CP-U17: validarFormatoToken retorna true para un token alfanumérico válido de 32 caracteres', () => {
    const tokenValido = 'a1b2c3d4e5f67890123456789abcdef0';
    expect(validarFormatoToken(tokenValido)).toBe(true);
  });

  // TEST 2: Caso Límite Inferior (-1 caracter)
  it('CP-U18: validarFormatoToken retorna false si el token tiene 31 caracteres', () => {
    const tokenCorto = 'a1b2c3d4e5f67890123456789abcdef';
    expect(validarFormatoToken(tokenCorto)).toBe(false);
  });

  // TEST 3: Caso Inválido (Símbolos especiales)
  it('CP-U19: validarFormatoToken retorna false si el token contiene caracteres no alfanuméricos', () => {
    const tokenInvalido = 'a1b2c3d4e5f67890123456789abcde-!';
    expect(validarFormatoToken(tokenInvalido)).toBe(false);
  });

  // ==========================================================================
  // FUNCIÓN 2: verificarExpiracionToken (Historia de Usuario: US_003)
  // ==========================================================================

  // TEST 4: Caso Límite Exacto (Minuto 60)
  it('CP-U20: verificarExpiracionToken retorna true en el límite exacto de 60 minutos transcurridos', () => {
    const creacion = '2026-09-24T10:00:00Z';
    const consultaLimite = '2026-09-24T11:00:00Z';
    expect(verificarExpiracionToken(creacion, consultaLimite, 60)).toBe(true);
  });

  // TEST 5: Caso Expirado / Borde Superior (Minuto 61)
  it('CP-U21: verificarExpiracionToken retorna false cuando han transcurrido 61 minutos desde su creación', () => {
    const creacion = '2026-09-24T10:00:00Z';
    const consultaExpirada = '2026-09-24T11:01:00Z';
    expect(verificarExpiracionToken(creacion, consultaExpirada, 60)).toBe(false);
  });

});