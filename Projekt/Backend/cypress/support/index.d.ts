declare namespace Cypress {
  interface Chainable {
    login(): Chainable<string>;
  }
}
