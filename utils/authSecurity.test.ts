import { describe, test, expect } from '@jest/globals';
import { verificarIntentosLogin } from './authSecurity';

describe('US_002: Inicio de Sesión Estándar - Control de Intentos de Seguridad (Integrante 1)', () => {
  
  // TEST 1: US_002 Escenario 2
  test('Debe incrementar el contador de intentos fallidos en +1 ante un ingreso de contraseña incorrecta', () => {
    const resultado = verificarIntentosLogin(0, false);
    
    expect(resultado.attempts).toBe(1);
  });

  // TEST 2: US_002 Escenario 2 (Caso Límite Seguro)
  test('El botón debe permanecer habilitado y no exigir Captcha si los intentos fallidos son menores a 5', () => {
    const resultado = verificarIntentosLogin(3, false); // Pasa de 3 a 4 intentos
    
    expect(resultado.isBlocked).toBe(false);
    expect(resultado.requiresCaptcha).toBe(false);
  });

  // TEST 3: US_002 Escenario 3 (Disparo del Bloqueo)
  test('El botón de inicio de sesión se debe bloquear y exigir Captcha obligatorio exactamente al llegar al 5to intento fallido consecutivo', () => {
    const resultado = verificarIntentosLogin(4, false); // Pasa de 4 a 5 intentos
    
    expect(resultado.isBlocked).toBe(true);
    expect(resultado.requiresCaptcha).toBe(true);
  });

});