import { validarNombre } from './validarNombre';

describe('US_013 - Identificación del Invitado por Nombre', () => {
  
  test('CP-US013-07: debe aceptar nombre válido con tildes (""Ana Gómez"")', () => {
    const resultado = validarNombre('Ana Gómez');
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });

  test('CP-US013-07b: debe aceptar nombre con eñe (""José Martínez"")', () => {
    const resultado = validarNombre('José Martínez');
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });

  test('CP-US013-08: debe rechazar nombre vacío', () => {
    const resultado = validarNombre('');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('El nombre es obligatorio');
  });

  test('CP-US013-08b: debe rechazar nombre con solo espacios', () => {
    const resultado = validarNombre('   ');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('El nombre es obligatorio');
  });

  test('CP-US013-09: debe rechazar ""Ana123!""', () => {
    const resultado = validarNombre('Ana123!');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('El nombre solo puede contener letras');
  });

  test('CP-US013-09b: debe rechazar solo números', () => {
    const resultado = validarNombre('12345');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('El nombre solo puede contener letras');
  });

  test('CP-US013-09c: debe rechazar solo símbolos', () => {
    const resultado = validarNombre('@#$%');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('El nombre solo puede contener letras');
  });

});
