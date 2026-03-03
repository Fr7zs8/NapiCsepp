/* eslint-env mocha, browser */
/* global cy, describe, it */
import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { UserStatsView } from '../../src/pages/adminPage/userStatsView'
import * as api from '../../src/router/apiRouter'

describe('UserStatsView (component)', () => {
  it('renders user info and statistics', () => {
    const users = [ { user_id: 2, username: 'UserTwo', email: 'u@u.hu', role: 'user', register_date: '2026-02-02' } ];
    const statsRaw = {
      total_activity: 5, completed: 2, daily_tasks_count: 1,
      monthly_events_count: 0, hard_tasks: 1, middle_tasks: 2,
      easy_tasks: 2, weekly_tasks: 7, weekly_tasks_completed: 3
    };

    cy.stub(api.clientService, 'getAllUsers').resolves(users);
    cy.stub(api.clientService, 'getUserStatistics').resolves(statsRaw);

    cy.mount(
      <MemoryRouter initialEntries={["/admin/user/2"]}>
        <Routes>
          <Route path="/admin/user/:userId" element={<UserStatsView />} />
        </Routes>
      </MemoryRouter>
    );

    cy.contains('UserTwo').should('exist');
    cy.get('.user-stat-number').first().should('contain.text', '5');
    cy.get('.completion-percent').first().should('exist');
  });
});
