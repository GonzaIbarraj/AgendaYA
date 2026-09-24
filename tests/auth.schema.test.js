/* eslint-disable @typescript-eslint/no-require-imports */
const { registerSchema, checkPasswordRequirements, emailRegex } = require('../lib/validations/auth.schema');

// Datos base válidos: cada test modifica solo el campo que quiere probar
const datosValidos = {
  email: 'ana@mail.com',
  password: 'Clave123!',
  confirmPassword: 'Clave123!',
};

// Devuelve la lista de mensajes de error que produce el esquema (vacía si los datos son válidos)
function mensajesDeError(datos) {
  const resultado = registerSchema.safeParse(datos);
  return resultado.success ? [] : resultado.error.issues.map((issue) => issue.message);
}

describe('US_001: Registro de usuario administrador - Validación del formulario (TP6)', () => {

  // TEST 1: US_001 Escenario 5 (Caso Normal)
  test('Debe aceptar un registro con correo válido y una contraseña que cumple la política de seguridad', () => {
    const resultado = registerSchema.safeParse(datosValidos);

    expect(resultado.success).toBe(true);
  });

  // TEST 2: US_001 Escenario 3 (Límite inferior - un carácter menos del mínimo)
  test('Debe rechazar una contraseña de 7 caracteres con el mensaje de longitud mínima', () => {
    const password = 'Cl123!a'; // 7 caracteres, con mayúscula, minúscula, número y especial

    const mensajes = mensajesDeError({ ...datosValidos, password, confirmPassword: password });

    expect(mensajes).toContain('La contraseña debe tener al menos 8 caracteres');
  });

  // TEST 3: US_001 Escenario 3 (Límite superior - exactamente el máximo)
  test('Debe aceptar una contraseña de exactamente 64 caracteres', () => {
    const password = 'Aa1!' + 'x'.repeat(60); // 64 caracteres

    const mensajes = mensajesDeError({ ...datosValidos, password, confirmPassword: password });

    expect(password).toHaveLength(64);
    expect(mensajes).toEqual([]);
  });

  // TEST 4: US_001 Escenario 3 (Límite superior - un carácter más del máximo)
  test('Debe rechazar una contraseña de 65 caracteres con el mensaje de longitud máxima', () => {
    const password = 'Aa1!' + 'x'.repeat(61); // 65 caracteres

    const mensajes = mensajesDeError({ ...datosValidos, password, confirmPassword: password });

    expect(mensajes).toContain('La contraseña no puede superar los 64 caracteres');
  });

  // TEST 5: US_001 Escenario 3 (Checklist dinámico de requisitos, función checkPasswordRequirements)
  test('El checklist debe marcar como incumplidos la longitud y el carácter especial para la contraseña "Clave1"', () => {
    const requisitos = checkPasswordRequirements('Clave1');

    expect(requisitos.minLength).toBe(false);
    expect(requisitos.hasSpecialChar).toBe(false);
    expect(requisitos.hasUppercase).toBe(true);
    expect(requisitos.hasLowercase).toBe(true);
    expect(requisitos.hasNumber).toBe(true);
  });

});

describe('US_001: Bug conocido en la validación de email (TP6)', () => {

  // BUG CONOCIDO (US_001 Escenario 2): la expresión regular acepta dos puntos seguidos en el dominio.
  // test.failing pasa mientras el bug exista. Cuando se corrija la regex, este test empezará a fallar:
  // en ese momento hay que cambiarlo por test() común.
  test.failing('emailRegex debería rechazar un correo con dos puntos seguidos en el dominio (juan@mail..com)', () => {
    expect(emailRegex.test('juan@mail..com')).toBe(false);
  });

});