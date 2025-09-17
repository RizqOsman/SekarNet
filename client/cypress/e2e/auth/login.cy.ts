describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/auth/login')
  })

  it('should display login form', () => {
    cy.get('input[name="email"]').should('exist')
    cy.get('input[name="password"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    cy.get('[data-testid="error-message"]').should('exist')
  })

  it('should login successfully with valid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('testpassword123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-menu"]').should('exist')
  })
})
