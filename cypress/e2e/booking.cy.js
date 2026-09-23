describe('AgendaYA - M04 Proceso de Reserva (Booking Público)', () => {
  beforeEach(() => {
    // Visitar el enlace público del profesional
    cy.visit('/pepe-lopez');
  });

  it('Debe permitir a un usuario invitado completar el flujo entero de reserva de turno (Flujo Feliz)', () => {
    // Paso 1: Bienvenida - Iniciar reserva
    cy.get('[data-cy="booking-start-button"]', { timeout: 15000 }).should('be.visible').click();

    // Paso 2: Selección de Tipo de Cita / Evento
    cy.get('[data-cy="event-type-card"]').first().should('be.visible').click();

    // Paso 3: Selección de Día y Franja Horaria Disponible en el Calendario
    cy.get('[data-cy="calendar-day-28"]').click();
    
    // Seleccionar la primera franja horaria habilitada
    cy.get('[data-cy^="time-slot-"]:not([disabled])').first().click();
    cy.get('[data-cy="confirm-datetime-button"]').click();

    // Paso 4: Carga de Datos Personales del Invitado
    const emailInvitado = `invitado.e2e.${Date.now()}@gmail.com`;
    const nombreInvitado = 'María Lucero';

    cy.get('[data-cy="guest-name-input"]').type(nombreInvitado);
    cy.get('[data-cy="guest-email-input"]').type(emailInvitado);
    cy.get('[data-cy="guest-phone-input"]').type('+54 9 11 9876-5432');

    // Continuar a la pantalla de revisión
    cy.get('[data-cy="review-booking-button"]').click();

    // Paso 5: Confirmación Final de la Reserva
    cy.get('[data-cy="confirm-booking-button"]').click();

    // Assertions: Verificar pantalla de éxito y generación de ID de reserva
    cy.get('[data-cy="booking-success-card"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy="booking-success-title"]').should('contain', 'Reserva confirmada');
    cy.get('[data-cy="booking-id-text"]').should('contain', 'RES-');
  });
});
