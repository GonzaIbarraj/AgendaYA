describe('AgendaYA - M01 Registro de usuario (US_001)', () => {
  it('rechaza el registro de un correo ya registrado y ofrece ir al inicio de sesión', () => {
    // Arrange: crear por API un usuario con un correo único; luego se intentará registrar ese mismo correo desde la pantalla
    const email = `registro.duplicado.${Date.now()}@agendaya.com`;
    const password = 'ClaveValida123!';

    cy.request('POST', '/api/auth/register', {
      email,
      password,
      confirmPassword: password,
    }).its('status').should('eq', 201);

    cy.visit('/register');

    // Act: completar el formulario con el correo ya registrado y una contraseña válida
    cy.get('[data-cy="register-email-input"]').type(email);
    cy.get('[data-cy="register-password-input"]').type(password);
    cy.get('[data-cy="register-confirm-password-input"]').type(password);
    cy.get('[data-cy="register-submit-button"]').should('not.be.disabled').click();

    // Assert: mensaje de correo duplicado con acceso al login y sin pantalla de registro exitoso
    cy.get('[data-cy="register-error-message"]')
      .should('be.visible')
      .and('contain', 'Este correo ya está registrado');
    cy.get('[data-cy="register-error-message"]').find('[data-cy="nav-login"]').should('be.visible');
    cy.get('[data-cy="register-success-message"]').should('not.exist');
  });
});