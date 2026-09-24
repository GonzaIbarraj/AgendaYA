/* eslint-disable @typescript-eslint/no-require-imports */
const { validarNombreProfesional } = require('../utils/professionalName');
const { validateEmail } = require('../utils/emailValidation');

describe('Pruebas Unitarias M01 - Utilidades de Perfil (Tarea C - Máximo Perea)', () => {

  // ==========================================================================
  // FUNCIÓN 1: validarNombreProfesional (Historia de Usuario: US_005)
  // ==========================================================================

  // TEST 1: Caso Normal (Exitoso)
  // Verifica que el sistema acepte un nombre y apellido estándar con formato correcto.
  it('CP-U12: validarNombreProfesional retorna valido=true para un nombre válido', () => {
    const resultado = validarNombreProfesional('Máximo Román Perea');
    
    expect(resultado.valido).toBe(true);
    // Asumimos que si es válido, el error viene nulo o indefinido
    expect(resultado.error).toBeFalsy(); 
  });

  // TEST 2: Caso Inválido (Límite Inferior - Vacío)
  // Verifica que el sistema rechace el campo si el usuario lo deja en blanco o con espacios.
  it('CP-U13: validarNombreProfesional retorna valido=false y mensaje de error si el campo está vacío', () => {
    const resultado = validarNombreProfesional('   '); // Cadena de espacios
    
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined(); 
  });

  // TEST 3: Caso Inválido (Contiene Números)
  // Verifica que el sistema rechace nombres con números, respetando la regla de negocio.
  it('CP-U14: validarNombreProfesional retorna valido=false si el nombre contiene números', () => {
    const resultado = validarNombreProfesional('Estudio Contable 123');
    
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined();
  });

  // TEST 4: Caso Inválido (Contiene Caracteres Especiales)
  // Verifica que el sistema rechace símbolos extraños que podrían generar errores o inyecciones.
  it('CP-U15: validarNombreProfesional retorna valido=false si el nombre contiene caracteres especiales', () => {
    const resultado = validarNombreProfesional('Máximo_Perea!@');
    
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined();
  });


  // ==========================================================================
  // FUNCIÓN 2: validateEmail (Historia de Usuario: US_006)
  // ==========================================================================

  // TEST 5: Caso Inválido (Estructura Rota / Formato Incorrecto)
  // Verifica que la utilidad rechace un correo al que le falta el dominio después de la arroba.
  it('CP-U16: validateEmail retorna isValid=false y un mensaje de error para un correo sin dominio', () => {
    const resultado = validateEmail('pepelopez@'); // Correo incompleto
    
    expect(resultado.isValid).toBe(false);
    expect(resultado.message).toBeDefined();
  });

});