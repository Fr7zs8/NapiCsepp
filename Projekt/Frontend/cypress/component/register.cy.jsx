/* eslint-env mocha, browser */
/* global cy, describe, it */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RegisterView } from '../../src/pages/loginPage/registerView/register'

describe('RegisterView (component)', () => {
  it('shows password mismatch validation', () => {
    cy.mount(
      <MemoryRouter>
        <RegisterView />
      </MemoryRouter>
    );

    cy.get('input[placeholder="KovacsJanos"]').type('Teszt');
    cy.get('input[placeholder="pelda@gmail.com"]').type('a@b.hu');
    cy.get('input[placeholder="Jelszó"]').type('pass1');
    cy.get('input[placeholder="Jelszó újra"]').type('pass2');

    cy.get('button[type="submit"]').click();

    cy.contains('A jelszavak nem egyeznek!').should('be.visible');
  });
});
