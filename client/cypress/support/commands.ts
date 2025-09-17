// Custom commands for Cypress
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('checkLoggedIn', () => {
  cy.get('[data-testid="user-menu"]').should('exist')
})

Cypress.Commands.add('checkLoggedOut', () => {
  cy.get('[data-testid="login-button"]').should('exist')
})
