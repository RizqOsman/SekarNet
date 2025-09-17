// Import commands.js using ES2015 syntax:
import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands types here
      login(email: string, password: string): Chainable<void>
      checkLoggedIn(): Chainable<void>
      checkLoggedOut(): Chainable<void>
    }
  }
}
