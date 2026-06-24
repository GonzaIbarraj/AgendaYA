export interface ResultadoValidacion {
  valido: boolean;
  error: string | null;
}

export function validarNombre(nombre: string): ResultadoValidacion {
  if (!nombre || nombre.trim() === '') {
    return { valido: false, error: 'El nombre es obligatorio' };
  }

  const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  if (!regexSoloLetras.test(nombre)) {
    return { valido: false, error: 'El nombre solo puede contener letras' };
  }

  return { valido: true, error: null };
}
