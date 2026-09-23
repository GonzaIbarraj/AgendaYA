describe('AgendaYA - M01 Autenticación y Perfil', () => {
  beforeEach(() => {
    // Visitar la página de inicio o registro del frontend
    cy.visit('/register');
  });

  it('Debe permitir el registro de un nuevo usuario, iniciar sesión y cerrar sesión correctamente (Flujo Feliz)', () => {
    // Arrange: preparar el estado inicial y los datos del nuevo usuario
    const emailTest = `test.e2e.${Date.now()}@agendaya.com`;
    const passwordTest = 'ClaveValida123!';

    // Act: ejecutar el registro de un nuevo usuario administrador (US_001)
    cy.get('[data-cy="register-email-input"]').type(emailTest);
    cy.get('[data-cy="register-password-input"]').type(passwordTest);
    cy.get('[data-cy="register-confirm-password-input"]').type(passwordTest);
    cy.get('[data-cy="register-submit-button"]').click();

    // Assert: verificar mensaje de confirmación de registro
    cy.get('[data-cy="register-success-message"]').should('be.visible');

    // Act: navegar a la pantalla de inicio de sesión (US_002)
    cy.get('[data-cy="nav-login"]').click();
    cy.url().should('include', '/login');

    // Act: ingresar las credenciales para iniciar sesión
    cy.get('[data-cy="login-email-input"]').type(emailTest);
    cy.get('[data-cy="login-password-input"]').type(passwordTest);
    cy.get('[data-cy="login-submit-button"]').click();

    // Assert: verificar la redirección al Dashboard y la presencia del mensaje de bienvenida
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="dashboard-welcome"]').should('be.visible');

    // Act: cerrar sesión desde el botón del menú lateral
    cy.get('[data-cy="logout-button"]').click();

    // Assert: verificar que retorna a la pantalla de login
    cy.url().should('include', '/login');
  });
});
