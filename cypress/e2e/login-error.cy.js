describe('AgendaYA - M01 Autenticación (Flujo de Error de Credenciales)', () => {
  beforeEach(() => {
    // Arrange: Inicializar la base de datos local con los usuarios de prueba
    cy.exec('node scripts/seed.cjs');
    // Arrange: Visitar la pantalla de login del frontend
    cy.visit('/login');
  });

  it('CP-M01-005: Debe rechazar el inicio de sesión con contraseña incorrecta y mostrar mensaje de error (Integrante: Gonzalo Ibarra)', () => {
    // Arrange: Definir credenciales de prueba con contraseña errónea
    const emailTest = 'pepelopez@gmail.com';
    const passwordErronea = 'ClaveFalsa123!';

    // Act: Completar el formulario e intentar autenticarse
    cy.get('[data-cy="login-email-input"]').type(emailTest);
    cy.get('[data-cy="login-password-input"]').type(passwordErronea);
    cy.get('[data-cy="login-submit-button"]').should('not.be.disabled').click();

    // Assert: Espera inteligente para que Next.js compile y muestre el mensaje de error
    cy.get('[data-cy="login-error-message"]', { timeout: 10000 })
      .should('be.visible');

    // Assert: Verificar permanencia en login y que no se cargó el dashboard
    cy.url().should('include', '/login');
    cy.get('[data-cy="dashboard-welcome"]').should('not.exist');
    cy.get('[data-cy="login-submit-button"]').should('not.be.disabled');
  });
});