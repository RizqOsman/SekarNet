import { defineConfig } from 'cypress'

export default defineConfig({
  component: true,
  video: false,
  screenshotOnRunFailure: true,
  supportFile: 'cypress/support/e2e.ts',
  baseUrl: 'http://localhost:5173',
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  watchForFileChanges: true,
  retries: {
    runMode: 2,
    openMode: 0
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config)
    },
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'
  }
})
