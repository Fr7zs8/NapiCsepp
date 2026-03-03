/* eslint-env mocha, browser */
/* global cy, describe, it, beforeEach, afterEach */
import { MemoryRouter } from 'react-router-dom'
import { AdminView } from '../../src/pages/adminPage/adminView'
import * as api from '../../src/router/apiRouter'

describe('AdminView (component)', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
  });

  afterEach(() => {
    localStorage.removeItem('user');
  });

  it('renders stats and user rows, opens edit and delete popups', () => {
    const users = [
      { user_id: 1, username: 'AdminOne', email: 'a@a.hu', role: 'admin', register_date: '2026-01-01' },
      { user_id: 2, username: 'UserTwo', email: 'u@u.hu', role: 'user', register_date: '2026-02-02' }
    ];

    cy.stub(api.clientService, 'getAllUsers').resolves(users);
    cy.stub(api.clientService, 'editUser').resolves({});
    cy.stub(api.clientService, 'deleteUser').resolves({});

    cy.mount(
      <MemoryRouter>
        <AdminView />
      </MemoryRouter>
    );

    // stats cards
    cy.get('.stat-number').first().should('contain.text', '2');

    // table rows
    cy.contains('AdminOne').should('exist');
    cy.contains('u@u.hu').should('exist');

    // open edit popup for first row
    cy.get('.edit-btn').first().click();
    cy.contains('Felhasználó szerkesztése').should('be.visible');

    // close popup
    cy.get('.popup-close-btn').click();

    // open delete popup for second row
    cy.get('.delete-btn').last().click();
    cy.contains('Felhasználó törlése').should('be.visible');
  });
});
