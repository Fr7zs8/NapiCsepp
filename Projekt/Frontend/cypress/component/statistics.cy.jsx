/* eslint-env mocha, browser */
/* global cy, describe, it */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { StatisticsView } from '../../src/pages/statisticsView/statisticsView'
import * as api from '../../src/router/apiRouter'

describe('StatisticsView (component)', () => {
  it('renders statistics counters after load', () => {
    cy.stub(api.clientService, 'getStatistics').resolves({ totalActivities: 6, completedActivities: 3, monthlyEventsCount: 2 });
    cy.stub(api.activityService, 'getAllActivities').resolves([]);
    cy.stub(api.activityService, 'getAllHabits').resolves([]);

    cy.mount(
      <MemoryRouter>
        <StatisticsView />
      </MemoryRouter>
    );

    cy.contains('Statisztikák').should('exist');
    cy.get('.counter-value').first().should('exist');
    cy.get('.progress-percent').should('exist');
  });
});
