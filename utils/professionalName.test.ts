import { describe, test, expect } from '@jest/globals';
import { validarNombreProfesional } from './professionalName';

describe('US_005: Validación de Nombre Profesional (Integrante 3)', () => {

  // Test Unitario 4 (Caso Positivo - US_005 Escenario 1)
  test('Debe devolver valido: true si se ingresa un nombre válido con letras, espacios y opcionalmente puntos, sin superar el límite', () => {
    const resultado = validarNombreProfesional("Dr. Carlos Mendoza");
    
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeUndefined();
  });

  // Test Unitario 5 (Caso Negativo / Vacío - US_005 Escenario 2)
  test('Debe devolver valido: false y el error "El nombre es obligatorio" si el campo está vacío o contiene solo espacios', () => {
    // Caso vacío
    const resultadoVacio = validarNombreProfesional("");
    expect(resultadoVacio.valido).toBe(false);
    expect(resultadoVacio.error).toBe("El nombre es obligatorio");

    // Caso con espacios en blanco
    const resultadoEspacios = validarNombreProfesional("   ");
    expect(resultadoEspacios.valido).toBe(false);
    expect(resultadoEspacios.error).toBe("El nombre es obligatorio");
  });

  // Test Unitario 6 (Caso Negativo / Caracteres Inválidos - US_005 Escenario 3)
  test('Debe devolver valido: false si se introducen números o símbolos no permitidos', () => {
    const resultadoInvalido = validarNombreProfesional("G0nza123!");
    
    expect(resultadoInvalido.valido).toBe(false);
    expect(resultadoInvalido.error).toBe("El nombre solo puede contener letras y espacios");
  });

});
