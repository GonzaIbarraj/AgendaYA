/* eslint-disable @typescript-eslint/no-require-imports */
const { validarEmail, validarPassword, evaluarIntentosLogin } = require('../src/auth');

describe('Pruebas Unitarias M01 - Autenticación y Perfil (Tarea C)', () => {
  // Test 1: Caso Normal - Validación de Email
  it('CP-U01: validarEmail retorna true para un correo con formato estándar válido', () => {
    const emailValido = 'usuario@dominio.com';
    const resultado = validarEmail(emailValido);
    expect(resultado).toBe(true);
  });

  // Test 2: Caso Inválido - Validación de Email
  it('CP-U02: validarEmail retorna false para un correo con formato incorrecto sin @', () => {
    const emailInvalido = 'usuario.dominio.com';
    const resultado = validarEmail(emailInvalido);
    expect(resultado).toBe(false);
  });

  // Test 3: Caso Borde/Límite - Validación de Email
  it('CP-U03: validarEmail retorna false ante una cadena vacía o compuesta solo por espacios', () => {
    const emailVacio = '   ';
    const resultado = validarEmail(emailVacio);
    expect(resultado).toBe(false);
  });

  // Test 4: Caso Normal - Validación de Contraseña Segura
  it('CP-U04: validarPassword retorna valido=true cuando cumple todas las políticas de seguridad y coinciden', () => {
    const pass = 'ClaveValida123!';
    const confirm = 'ClaveValida123!';
    const resultado = validarPassword(pass, confirm);
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });

  // Test 5: Caso Borde/Inválido - Límite Inferior de Longitud de Contraseña
  it('CP-U05: validarPassword retorna valido=false y error cuando la clave tiene 7 caracteres (límite inferior -1)', () => {
    const passCorta = 'Ab1!567'; // 7 caracteres
    const confirm = 'Ab1!567';
    const resultado = validarPassword(passCorta, confirm);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('La contraseña debe tener entre 8 y 64 caracteres');
  });

  // Test 6: Caso Límite - Evaluación de Bloqueo tras 5to Intento Fallido
  it('CP-U06: evaluarIntentosLogin activa isBlocked y requiresCaptcha al alcanzar el 5to intento fallido', () => {
    const resultado = evaluarIntentosLogin(4, false);
    expect(resultado.attempts).toBe(5);
    expect(resultado.isBlocked).toBe(true);
    expect(resultado.requiresCaptcha).toBe(true);
  });
});
