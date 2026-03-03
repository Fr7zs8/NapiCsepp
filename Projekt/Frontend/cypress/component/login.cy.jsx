/* eslint-env mocha, browser */
/* global cy, describe, it */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { LoginView } from '../../src/pages/loginPage/loginView/login'
import * as api from '../../src/router/apiRouter'

describe('LoginView (component)', () => {
  it('shows error when login fails', () => {
    cy.stub(api.clientService, 'login').rejects(new Error('Hibás email vagy jelszó!'));

    cy.mount(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    cy.get('input[type="email"]').type('foo@bar.hu');
    cy.get('input[placeholder="Jelszó"]').type('badpass');
    cy.get('button[type="submit"]').click();

    cy.contains('Hibás email vagy jelszó!').should('be.visible');
  });
});
