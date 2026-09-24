describe("AgendaYA - Conflicto de horario al confirmar", () => {

  beforeEach(() => {
    cy.intercept(
      "GET",
      "/api/public/pepe-lopez",
      {
        statusCode: 200,
        body: {
          success: true,
          professional: {
            id: "prof-1",
            name: "Pepe López",
            specialty: "Psicología Clínica",
            bio: "Especialista en terapia",
            photoUrl: null,
            publicSlug: "pepe-lopez",
            eventTypes: [
              {
                id: "ev-1",
                title: "Consulta Individual",
                durationMinutes: 30,
                description: "Consulta individual",
              },
            ],
          },
        },
      }
    ).as("getProfessional");

    cy.intercept(
      "POST",
      "/api/appointments/book",
      {
        statusCode: 409,
        body: {
          success: false,
          message: "Lo sentimos, este horario acaba de ser reservado",
          redirigirAlCalendario: true,
        },
      }
    ).as("bookingConflict");

    cy.visit("/pepe-lopez");

    cy.wait("@getProfessional");
  });


  it("debe impedir confirmar la reserva si el horario fue ocupado por otra persona", () => {

    // ARRANGE
    cy.get('[data-cy="booking-start-button"]')
      .should("be.visible")
      .click();

    cy.get('[data-cy="event-type-card"]')
      .first()
      .click();

    cy.get('[data-cy="calendar-day-28"]')
      .click();

    cy.get('[data-cy^="time-slot-"]:not([disabled])')
      .first()
      .click();

    cy.get('[data-cy="confirm-datetime-button"]')
      .click();

    cy.get('[data-cy="guest-name-input"]')
      .type("Lucía Pérez");

    cy.get('[data-cy="guest-email-input"]')
      .type("lucia@email.com");

    cy.get('[data-cy="guest-phone-input"]')
      .type("+54 261 5551234");

    cy.get('[data-cy="review-booking-button"]')
      .click();


    // ACT
    cy.get('[data-cy="confirm-booking-button"]')
      .click();
    cy.wait("@bookingConflict");


    // ASSERT
    cy.get('[data-cy="booking-error-message"]')
    .should("be.visible")
    .and(
        "contain",
        "Lo sentimos, este horario acaba de ser reservado"
    );
    cy.get('[data-cy="booking-success-card"]')
      .should("not.exist");

    cy.get('[data-cy="confirm-datetime-button"]')
        .should("be.visible");
  });
});