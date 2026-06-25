/**
 * Valida el correo electrónico de un invitado según la US_014.
 * @param email El texto ingresado por el usuario.
 * @returns Un objeto con el resultado y el mensaje de error si corresponde.
 */
export const validateEmail = (email: string) => {
  // Escenario 2: El correo es obligatorio [2]
  if (!email || email.trim() === "") {
    return { isValid: false, message: "El correo electrónico es obligatorio" };
  }

  // Escenario 3: Formato estándar (usuario@dominio.com) 
  // Esta regex verifica que haya texto, un @, más texto, un punto y un dominio.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: "Formato de correo inválido. Ej: usuario@dominio.com" 
    };
  }

  // Escenario 1: Caso exitoso 
  return { isValid: true, message: "" };
};
