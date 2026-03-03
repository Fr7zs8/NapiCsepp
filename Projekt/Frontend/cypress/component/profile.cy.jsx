/* eslint-env mocha, browser */
/* global cy, describe, it */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ProfileView } from '../../src/pages/profileView/profile'
import * as api from '../../src/router/apiRouter'

describe('ProfileView (component)', () => {
  it('renders profile data and opens edit popup', () => {
    cy.stub(api.clientService, 'getProfile').resolves({ username: 'UserX', email: 'userx@a.hu', role: 'user', register_date: '2025-01-01' });
    cy.stub(api.clientService, 'getStatistics').resolves({ totalActivities: 3, completedActivities: 1, monthlyEventsCount: 0 });
    cy.stub(api.activityService, 'getAllHabits').resolves([]);

    cy.mount(
      <MemoryRouter>
        <ProfileView />
      </MemoryRouter>
    );

  cy.contains('Profil').should('exist');
  // ProfileCard renders username as @username (lowercased)
  cy.get('.username').should('contain.text', '@userx');
  cy.contains('userx@a.hu').should('exist');

    cy.get('.edit-profile-btn').click();
    cy.contains('Adatok szerkesztése').should('be.visible');
  });
});
