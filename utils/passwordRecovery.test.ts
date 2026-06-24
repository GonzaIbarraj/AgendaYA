import { describe, test, expect } from '@jest/globals';
import { 
  procesarSolicitudRecuperacion, 
  verificarValidezToken, 
  RecoveryToken 
} from './passwordRecovery';

describe('US_003: Solicitud de recuperación de contraseña (Integrante 2)', () => {
  
  // TEST 1: US_003 Escenario 1 (Generación y tiempo de validez)
  test('Debe generar un token con exactamente 60 minutos de validez y devolver un mensaje neutro', () => {
    const tiempoActual = new Date('2026-06-24T10:00:00Z').getTime();
    const tokensPrevios: RecoveryToken[] = [];
    
    const resultado = procesarSolicitudRecuperacion('admin@empresa.com', true, tokensPrevios, tiempoActual);
    
    expect(resultado.nuevoToken).not.toBeNull();
    // 60 minutos * 60 segundos * 1000 ms = 3,600,000 ms
    expect(resultado.nuevoToken?.expiresAt).toBe(tiempoActual + 3600000);
    expect(resultado.mensajeUI).toBe('Si ese correo está registrado, recibirás un enlace en los próximos minutos');
  });

  // TEST 2: US_003 Escenario 3 (Múltiples solicitudes / Invalida el anterior)
  test('Al solicitar un segundo enlace, el token anterior debe quedar invalidado automáticamente', () => {
    const tiempoActual = new Date('2026-06-24T10:00:00Z').getTime();
    
    // Simulamos que ya existía un token generado previamente
    const tokenPrevio: RecoveryToken = {
      tokenString: 'token-viejo-123',
      email: 'admin@empresa.com',
      expiresAt: tiempoActual + 3600000,
      isValid: true // Aún válido en tiempo, pero será pisado
    };
    
    const resultado = procesarSolicitudRecuperacion('admin@empresa.com', true, [tokenPrevio], tiempoActual);
    
    // Buscamos el token viejo en la lista actualizada
    const tokenViejoActualizado = resultado.tokensActualizados.find(t => t.tokenString === 'token-viejo-123');
    
    expect(resultado.nuevoToken?.tokenString).not.toBe('token-viejo-123');
    expect(tokenViejoActualizado?.isValid).toBe(false); // El sistema lo invalidó
  });

  // TEST 3: US_003 Escenario 5 (Uso de enlace expirado)
  test('Debe rechazar el token si se intenta usar después de 60 minutos de su generación', () => {
    const tiempoGeneracion = new Date('2026-06-24T10:00:00Z').getTime();
    // Simulamos un intento de uso 61 minutos después
    const tiempoIntentoUso = tiempoGeneracion + (61 * 60 * 1000); 

    const tokenExpirado: RecoveryToken = {
      tokenString: 'token-expirado-456',
      email: 'admin@empresa.com',
      expiresAt: tiempoGeneracion + (60 * 60 * 1000), // Expiraba a los 60 min
      isValid: true 
    };

    const validacion = verificarValidezToken(tokenExpirado, tiempoIntentoUso);

    expect(validacion.valido).toBe(false);
    expect(validacion.error).toBe('Este enlace ha expirado. Por favor solicitá uno nuevo');
  });

});