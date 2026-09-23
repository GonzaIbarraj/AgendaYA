/* eslint-disable @typescript-eslint/no-require-imports */
const { confirmarReserva, generarIdReserva, validarNombreInvitado } = require('../src/booking');

describe('Pruebas Unitarias M04 - Proceso de Reserva (Booking Público)', () => {

  const datosReservaBase = {
    nombreUsuario: 'María Lucero',
    email: 'lucero@ejemplo.com',
    profesional: 'Pepe López',
    evento: 'Consulta Individual',
    fecha: '2026-04-28',
    hora: '11:30',
  };

  // Test 1: Confirmación Exitosa de Reserva (Flujo Feliz)
  it('CP-U07: confirmarReserva retorna estado CONFIRMADA y reservaRegistrada=true cuando el turno está libre y el servidor responde', () => {
    const resultado = confirmarReserva(true, true, datosReservaBase, 1);
    
    expect(resultado.estado).toBe('CONFIRMADA');
    expect(resultado.reservaRegistrada).toBe(true);
    expect(resultado.turnoBloqueado).toBe(true);
    expect(resultado.enviarCorreo).toBe(true);
    expect(resultado.mensaje).toBe('Reserva confirmada correctamente');
  });

  // Test 2: Generación del ID Único de Reserva
  it('CP-U08: generarIdReserva produce un identificador válido con formato RES-YYYYMMDD-XXXX', () => {
    const idReserva = generarIdReserva('2026-04-28', 15);
    
    expect(idReserva).toBe('RES-20260428-0015');
    expect(idReserva).toMatch(/^RES-\d{8}-\d{4}$/);
  });

  // Test 3: Manejo de Conflicto por Horario Ocupado
  it('CP-U09: confirmarReserva retorna HORARIO_OCUPADO y redirigirAlCalendario=true cuando el turno ya no está disponible', () => {
    const resultado = confirmarReserva(false, true, datosReservaBase);
    
    expect(resultado.estado).toBe('HORARIO_OCUPADO');
    expect(resultado.reservaRegistrada).toBe(false);
    expect(resultado.redirigirAlCalendario).toBe(true);
    expect(resultado.mensaje).toBe('Lo sentimos, este horario acaba de ser reservado');
  });

  // Test 4: Manejo de Fallo del Servidor con Conservación de Datos
  it('CP-U10: confirmarReserva retorna ERROR_SERVIDOR y reintentoHabilitado=true ante fallo de red/servidor', () => {
    const resultado = confirmarReserva(true, false, datosReservaBase);
    
    expect(resultado.estado).toBe('ERROR_SERVIDOR');
    expect(resultado.reservaRegistrada).toBe(false);
    expect(resultado.reintentoHabilitado).toBe(true);
    expect(resultado.datosConservados).toBe(true);
    expect(resultado.datosReserva.nombreUsuario).toBe('María Lucero');
  });

  // Test 5: Validación del Nombre del Invitado
  it('CP-U11: validarNombreInvitado aprueba nombres válidos (>= 2 caracteres) y rechaza nombres vacíos o de 1 carácter', () => {
    const valido = validarNombreInvitado('María Lucero');
    const invalidoVacio = validarNombreInvitado('   ');
    const invalidoCorto = validarNombreInvitado('A');

    expect(valido.valido).toBe(true);
    expect(valido.error).toBeNull();

    expect(invalidoVacio.valido).toBe(false);
    expect(invalidoVacio.error).toBe('El nombre es obligatorio');

    expect(invalidoCorto.valido).toBe(false);
    expect(invalidoCorto.error).toBe('El nombre debe tener al menos 2 caracteres');
  });
});
