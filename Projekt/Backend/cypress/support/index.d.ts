declare namespace Cypress {
  interface Chainable {
    login(): Chainable<string>;
    loginWithEmptyUser(): Chainable<string>;
  }
}
