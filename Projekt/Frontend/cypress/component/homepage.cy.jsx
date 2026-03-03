/* eslint-env mocha, browser */
/* global cy, describe, it */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { HomepageView } from '../../src/pages/homePage/homepage'
import * as api from '../../src/router/apiRouter'

describe('HomepageView (component)', () => {
  it('renders user info and progress after loading', () => {
    // stub services
    cy.stub(api.clientService, 'getProfile').resolves({ username: 'TesztFelhasznalo' });
    cy.stub(api.clientService, 'getStatistics').resolves({ totalActivities: 4, completedActivities: 2, monthlyEventsCount: 1 });
    cy.stub(api.activityService, 'getAllHabits').resolves([]);

    cy.mount(
      <MemoryRouter>
        <HomepageView />
      </MemoryRouter>
    );

    // wait for async effects to resolve and rerender
    cy.contains('Szia TesztFelhasznalo').should('be.visible');
    cy.get('.progress-badge').should('exist');
    cy.get('.carousel-text').should('exist');
    cy.get('.quick-access-list-div').within(() => {
      cy.contains('Naptár').should('exist');
      cy.contains('Feladatok').should('exist');
      cy.contains('Szokások').should('exist');
    });
  });
});
