// ── Custom Cypress commands ──────────────────────────────

// Fake login: sets a token + user object in localStorage so ProtectedRouter allows access
Cypress.Commands.add('fakeLogin', (overrides = {}) => {
  const user = {
    id: 1,
    username: overrides.username || 'TestUser',
    email: overrides.email || 'test@test.hu',
    role: overrides.role || 'user',
    register_date: '2025-01-01',
    ...overrides,
  };
  window.localStorage.setItem('authToken', 'fake-jwt-token-for-testing');
  window.localStorage.setItem('user', JSON.stringify(user));
});

// Stub all common API calls so pages can render without a running backend
// Real endpoints use /napicsepp/ prefix with baseUrl http://localhost:3000
Cypress.Commands.add('stubApi', () => {
  // Profile  (GET /napicsepp/profile)
  cy.intercept('GET', '**/napicsepp/profile', {
    statusCode: 200,
    body: {
      user_id: 1,
      username: 'TestUser',
      email: 'test@test.hu',
      role: 'user',
      register_date: '2025-01-01',
    },
  }).as('getProfile');

  // Statistics  (GET /napicsepp/stats)
  cy.intercept('GET', '**/napicsepp/stats', {
    statusCode: 200,
    body: {
      total_activity: 12,
      completed: 8,
      daily_tasks_count: 3,
      monthly_events_count: 5,
      hard_tasks: 3,
      middle_tasks: 5,
      easy_tasks: 4,
      weekly_tasks: 7,
      weekly_tasks_completed: 4,
    },
  }).as('getStatistics');

  // Activities  (GET /napicsepp/activities)
  cy.intercept('GET', '**/napicsepp/activities', {
    statusCode: 200,
    body: [
      {
        activity_id: 1,
        activity_name: 'Teszt feladat',
        type_name: 'Teendő',
        difficulty_name: 'Könnyű',
        activity_achive: 0,
        activity_start_date: new Date().toISOString().split('T')[0],
        activity_end_date: new Date().toISOString().split('T')[0],
      },
      {
        activity_id: 2,
        activity_name: 'Kész feladat',
        type_name: 'Teendő',
        difficulty_name: 'Közepes',
        activity_achive: 1,
        activity_start_date: new Date().toISOString().split('T')[0],
        activity_end_date: new Date().toISOString().split('T')[0],
      },
    ],
  }).as('getActivities');

  // Habits  (GET /napicsepp/activities/habits)
  cy.intercept('GET', '**/napicsepp/activities/habits', {
    statusCode: 200,
    body: [
      {
        activity_id: 10,
        activity_name: 'Futás',
        type_name: 'Szokás',
        difficulty_name: 'Közepes',
        activity_start_date: '2026-02-20',
        activity_end_date: '2026-03-20',
        target_days: 28,
        progress_counter: 5,
      },
    ],
  }).as('getHabits');

  // Events  (GET /napicsepp/events)
  cy.intercept('GET', '**/napicsepp/events**', {
    statusCode: 200,
    body: [
      {
        event_id: 1,
        event_name: 'Teszt esemény',
        event_description: 'Leírás',
        event_start_date: '2026-02-26',
        event_start_time: '10:00',
        event_end_date: '2026-02-26',
        event_end_time: '11:00',
        event_color: '#22c55e',
      },
    ],
  }).as('getEvents');

  // Difficulties  (GET /napicsepp/difficulties)
  cy.intercept('GET', '**/napicsepp/difficulties', {
    statusCode: 200,
    body: [
      { difficulty_id: 1, difficulty_name: 'Könnyű' },
      { difficulty_id: 2, difficulty_name: 'Közepes' },
      { difficulty_id: 3, difficulty_name: 'Nehéz' },
    ],
  }).as('getDifficulties');

  // Types  (GET /napicsepp/types)
  cy.intercept('GET', '**/napicsepp/types', {
    statusCode: 200,
    body: [
      { type_id: 1, type_name: 'Teendő' },
      { type_id: 2, type_name: 'Szokás' },
    ],
  }).as('getTypes');

  // POST / PUT / DELETE stubs
  cy.intercept('POST', '**/napicsepp/activities', { statusCode: 201, body: { success: true } }).as('createActivity');
  cy.intercept('PUT', '**/napicsepp/activities/**', { statusCode: 200, body: { success: true } }).as('updateActivity');
  cy.intercept('DELETE', '**/napicsepp/activities/**', { statusCode: 200, body: { success: true } }).as('deleteActivity');
  cy.intercept('POST', '**/napicsepp/events', { statusCode: 201, body: { success: true } }).as('createEvent');
  cy.intercept('PUT', '**/napicsepp/events/**', { statusCode: 200, body: { success: true } }).as('updateEvent');
  cy.intercept('DELETE', '**/napicsepp/events/**', { statusCode: 200, body: { success: true } }).as('deleteEvent');
  cy.intercept('PUT', '**/napicsepp/users/**', { statusCode: 200, body: { success: true } }).as('updateProfile');

  // Admin: Users list  (GET /napicsepp/users)
  cy.intercept('GET', '**/napicsepp/users', {
    statusCode: 200,
    body: [
      { user_id: 1, username: 'TestUser', email: 'test@test.hu', role: 'admin', register_date: '2025-01-01' },
      { user_id: 2, username: 'ModUser', email: 'mod@test.hu', role: 'moderator', register_date: '2025-03-15' },
      { user_id: 3, username: 'NormalUser', email: 'normal@test.hu', role: 'user', register_date: '2025-06-10' },
      { user_id: 4, username: 'JohnDoe', email: 'john@test.hu', role: 'user', register_date: '2025-08-20' },
    ],
  }).as('getUsers');

  // Admin: User stats  (GET /napicsepp/stats/:id)
  cy.intercept('GET', '**/napicsepp/stats/*', {
    statusCode: 200,
    body: {
      total_activity: 10,
      completed: 6,
      daily_tasks_count: 3,
      monthly_events_count: 4,
      hard_tasks: 2,
      middle_tasks: 5,
      easy_tasks: 3,
      weekly_tasks: 7,
      weekly_tasks_completed: 4,
    },
  }).as('getUserStats');

  // Admin: Delete user  (DELETE /napicsepp/users/:id)
  cy.intercept('DELETE', '**/napicsepp/users/**', { statusCode: 200, body: { success: true } }).as('deleteUser');
});

// Visit a protected page (sets fake login + stubs first)
Cypress.Commands.add('visitProtected', (path) => {
  cy.fakeLogin();
  cy.stubApi();
  cy.visit(path);
});

// Visit a protected page as admin
Cypress.Commands.add('visitProtectedAsAdmin', (path) => {
  cy.fakeLogin({ role: 'admin' });
  cy.stubApi();
  cy.visit(path);
});