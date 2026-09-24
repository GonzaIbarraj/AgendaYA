describe('AgendaYA - M01 Autenticación y Perfil (Flujo de Seguridad)', () => {
  beforeEach(() => {
    // 1. Limpiar y reiniciar el estado de la BD local (Prerrequisito del test)
    cy.exec('node scripts/seed.cjs');
    
    // 2. Visitar la pantalla de login
    cy.visit('/login');
  });

  it('CP-M01-002: Debe bloquear el inicio de sesión y exigir Captcha tras 5 intentos fallidos (Integrante: Máximo Perea)', () => {
    const emailTest = 'pepelopez@gmail.com';
    const passwordIncorrecta = 'ClaveFalsa123!';

    cy.get('[data-cy="login-email-input"]').type(emailTest);

    // Iterar los primeros 4 intentos fallidos
    for (let i = 1; i <= 4; i++) {
      cy.get('[data-cy="login-password-input"]').clear().type(passwordIncorrecta);
      
      // Esperar a que el frontend procese la respuesta y rehabilite el botón
      cy.get('[data-cy="login-submit-button"]')
        .should('not.be.disabled')
        .click();
      
      cy.get('[data-cy="login-error-message"]')
        .should('be.visible');
    }

    // Quinto intento fallido (Dispara el bloqueo real)
    cy.get('[data-cy="login-password-input"]').clear().type(passwordIncorrecta);
    
    cy.get('[data-cy="login-submit-button"]')
      .should('not.be.disabled')
      .click();

    // Verificaciones de Seguridad (El Captcha entra en acción)
    cy.get('[data-cy="login-submit-button"]').should('be.disabled');
    cy.get('[data-cy="captcha-container"]').should('be.visible');
    
    // Resolver el desafío Captcha simulado (5 + 3 = 8)
    cy.get('[data-cy="captcha-input"]').type('8');
    
    // Verificación final de recuperación de la interfaz
    cy.contains('Desafío resuelto').should('be.visible');
    cy.get('[data-cy="login-submit-button"]').should('not.be.disabled');
  });
});