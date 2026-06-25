import { validateEmail } from './emailValidation';

describe('Pruebas Unitarias - Validación del Email de Notificación (US_014)', () => {

  // Test Unitario 13 (Escenario 1) 
  test('Debe validar como correcto un correo con formato estándar y dominio válido', () => {
    const emailValido = "juancastro@gmail.com";
    const result = validateEmail(emailValido);
    
    expect(result.isValid).toBe(true);
    expect(result.message).toBe("");
  });

  // Test Unitario 14 (Escenario 2) [2]
  test('Debe rechazar el campo si se envía vacío con el mensaje obligatorio', () => {
    const emailVacio = "";
    const result = validateEmail(emailVacio);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("El correo electrónico es obligatorio");
  });

  // Test Unitario 15 (Escenario 3) 
  test('Debe devolver false y error de formato si falta el @ o el dominio completo', () => {
    const emailsInvalidos = ["juan@mail", "juan.com"];
    const expectedError = "Formato de correo inválido. Ej: usuario@dominio.com";

    emailsInvalidos.forEach(email => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe(expectedError);
    });
  });

});
