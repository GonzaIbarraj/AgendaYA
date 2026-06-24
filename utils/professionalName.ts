export interface NameValidationResult {
  valido: boolean;
  error?: string;
}

/**
 * Valida el nombre profesional del administrador en su perfil (US_005).
 * @param nombre Nombre ingresado por el usuario.
 * @returns Un objeto NameValidationResult indicando si es válido y el mensaje de error si aplica.
 */
export function validarNombreProfesional(nombre: string | null | undefined): NameValidationResult {
  // Escenario 2: Campo vacío o con espacios en blanco
  if (!nombre || nombre.trim() === "") {
    return {
      valido: false,
      error: "El nombre es obligatorio",
    };
  }

  // Escenario 1: Límite de caracteres (definimos un límite razonable de 50 caracteres)
  const LIMITE_CARACTERES = 50;
  if (nombre.length > LIMITE_CARACTERES) {
    return {
      valido: false,
      error: `El nombre no puede superar los ${LIMITE_CARACTERES} caracteres`,
    };
  }

  // Escenario 3: Caracteres válidos (solo letras, espacios y puntos para abreviaturas como "Dr.")
  const regexLetrasEspacios = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ. ]+$/;
  if (!regexLetrasEspacios.test(nombre)) {
    return {
      valido: false,
      error: "El nombre solo puede contener letras y espacios",
    };
  }

  return {
    valido: true,
  };
}
