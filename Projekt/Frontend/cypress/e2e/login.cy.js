/// <reference types="cypress" />

describe('Login oldal', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('1 - Megjeleníti a login oldalt', () => {
    cy.get('.login-page-shell').should('be.visible');
  });

  it('2 - Tartalmazza a fejléc szöveget', () => {
    cy.get('.login-header-div h1').should('contain.text', 'NapiCsepp');
  });

  it('3 - Tartalmazza az alcím szöveget', () => {
    cy.get('.login-header-div h3').should('contain.text', 'DailyDrop');
  });

  it('4 - Megjeleníti az email mezőt', () => {
    cy.get('input[type="email"]').should('be.visible').and('have.attr', 'placeholder', 'pelda@email.hu');
  });

  it('5 - Megjeleníti a jelszó mezőt', () => {
    cy.get('input[type="password"]').should('be.visible').and('have.attr', 'placeholder', 'Jelszó');
  });

  it('6 - Tartalmazza a Belépés gombot', () => {
    cy.get('.login-button-div button[type="submit"]').should('contain.text', 'Belépés');
  });

  it('7 - Email mező kitölthető', () => {
    cy.get('input[type="email"]').type('teszt@email.hu').should('have.value', 'teszt@email.hu');
  });

  it('8 - Jelszó mező kitölthető', () => {
    cy.get('input[type="password"]').type('jelszo123').should('have.value', 'jelszo123');
  });

  it('9 - Üres form nem küldhető el (HTML5 validation)', () => {
    cy.get('.login-button-div button[type="submit"]').click();
    // Az oldal nem navigál el — maradunk a login oldalon
    cy.url().should('include', '/login');
  });

  it('10 - Hibás bejelentkezés hibaüzenetet jelenít meg', () => {
    cy.intercept('POST', '**/napicsepp/login', {
      statusCode: 401,
      body: { message: 'Hibás email vagy jelszó!' },
    }).as('loginFail');

    cy.get('input[type="email"]').type('rossz@email.hu');
    cy.get('input[type="password"]').type('rosszjelszo');
    cy.get('.login-button-div button[type="submit"]').click();

    cy.get('.error-message').should('be.visible');
  });

  it('11 - Sikeres login átirányít', () => {
    cy.intercept('POST', '**/napicsepp/login', {
      statusCode: 200,
      body: { token: 'fake-token', user: { id: 1, username: 'Teszt', email: 'test@test.hu', role: 'user' } },
    }).as('loginSuccess');
    cy.intercept('GET', '**/napicsepp/profile', {
      statusCode: 200,
      body: { user_id: 1, username: 'Teszt', email: 'test@test.hu', role: 'user', register_date: '2025-01-01' },
    }).as('getProfile');
    cy.intercept('GET', '**/napicsepp/stats', { statusCode: 200, body: { total_activity: 0, completed: 0, monthly_events: 0, hard: 0, middle: 0, easy: 0 } }).as('getStats');
    cy.intercept('GET', '**/napicsepp/activities', { statusCode: 200, body: [] }).as('getActivities');
    cy.intercept('GET', '**/napicsepp/activities/habits', { statusCode: 200, body: [] }).as('getHabits');
    cy.intercept('GET', '**/napicsepp/events**', { statusCode: 200, body: [] }).as('getEvents');

    cy.get('input[type="email"]').type('test@test.hu');
    cy.get('input[type="password"]').type('jelszo123');
    cy.get('.login-button-div button[type="submit"]').click();

    cy.wait('@loginSuccess');
    cy.url().should('not.include', '/login');
  });

  it('12 - A Login/Register switch megjelenik', () => {
    cy.get('.switchlabel').should('contain.text', 'Jelentkezz be');
  });

  it('13 - Van "Még nincs fiókod? Regisztráció" link', () => {
    cy.get('.form-footer').should('contain.text', 'Regisztráció');
  });

  it('14 - Regisztráció linkre kattintás átirányít a /register oldalra', () => {
    cy.get('.form-footer a').click();
    cy.url().should('include', '/register');
  });

  it('15 - Bejelentkezés közben a gomb "Belépés..." szöveget mutat', () => {
    cy.intercept('POST', '**/napicsepp/login', {
      statusCode: 200,
      body: { token: 'tok', user: { id: 1, username: 'T', email: 't@t.hu', role: 'user' } },
      delay: 1000,
    }).as('loginSlow');
    cy.intercept('GET', '**/napicsepp/profile', {
      statusCode: 200,
      body: { user_id: 1, username: 'T', email: 't@t.hu', role: 'user', register_date: '2025-01-01' },
      delay: 1000,
    }).as('getProfileSlow');

    cy.get('input[type="email"]').type('test@test.hu');
    cy.get('input[type="password"]').type('jelszo123');
    cy.get('.login-button-div button[type="submit"]').click();
    cy.get('.login-button-div button').should('contain.text', 'Belépés...');
  });
});

describe('Regisztráció oldal', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('1 - Megjeleníti a regisztráció oldalt', () => {
    cy.get('.register-page-shell').should('be.visible');
  });

  it('2 - Tartalmazza a fejléc szöveget', () => {
    cy.get('.register-header-div h1').should('contain.text', 'NapiCsepp');
  });

  it('3 - Megjeleníti a felhasználónév mezőt', () => {
    cy.get('input[type="text"]').should('be.visible');
  });

  it('4 - Megjeleníti az email mezőt', () => {
    cy.get('input[type="email"]').should('be.visible');
  });

  it('5 - Megjeleníti a két jelszó mezőt', () => {
    cy.get('input[type="password"]').should('have.length', 2);
  });

  it('6 - Tartalmazza a Regisztráció gombot', () => {
    cy.get('.register-button-div button[type="submit"]').should('contain.text', 'Regisztráció');
  });

  it('7 - Felhasználónév mező kitölthető', () => {
    cy.get('input[type="text"]').type('TesztUser').should('have.value', 'TesztUser');
  });

  it('8 - Üres form nem küldhető el', () => {
    cy.get('.register-button-div button[type="submit"]').click();
    cy.url().should('include', '/register');
  });

  it('9 - Nem egyező jelszavak hibaüzenetet adnak', () => {
    cy.get('input[type="text"]').type('TesztUser');
    cy.get('input[type="email"]').type('test@test.hu');
    cy.get('input[type="password"]').first().type('jelszo123');
    cy.get('input[type="password"]').last().type('masikjelszo');
    cy.get('.register-button-div button[type="submit"]').click();

    cy.get('.error-message').should('be.visible');
  });

  it('10 - Rövid jelszó hibaüzenetet ad', () => {
    cy.get('input[type="text"]').type('TesztUser');
    cy.get('input[type="email"]').type('test@test.hu');
    cy.get('input[type="password"]').first().type('ab');
    cy.get('input[type="password"]').last().type('ab');
    cy.get('.register-button-div button[type="submit"]').click();

    cy.get('.error-message').should('be.visible');
  });

  it('11 - Switch label "Hozz létre új fiókot" szöveget mutat', () => {
    cy.get('.switchlabel').should('contain.text', 'Hozz létre új fiókot');
  });

  it('12 - Van "Van fiókod? Belépés" link', () => {
    cy.get('.form-footer').should('contain.text', 'Belépés');
  });

  it('13 - Belépés linkre kattintás átirányít /login-re', () => {
    cy.get('.form-footer a').click();
    cy.url().should('include', '/login');
  });

  it('14 - Sikeres regisztráció átirányít', () => {
    cy.intercept('POST', '**/napicsepp/regisztrate', { statusCode: 201, body: { success: true } }).as('regOk');
    cy.intercept('POST', '**/napicsepp/login', {
      statusCode: 200,
      body: { token: 'tok', user: { id: 1, username: 'U', email: 'u@u.hu', role: 'user' } },
    }).as('loginOk');
    cy.intercept('GET', '**/napicsepp/profile', {
      statusCode: 200,
      body: { user_id: 1, username: 'U', email: 'u@u.hu', role: 'user', register_date: '2025-01-01' },
    }).as('getProfile');
    cy.intercept('GET', '**/napicsepp/stats', { statusCode: 200, body: { total_activity: 0, completed: 0, monthly_events: 0, hard: 0, middle: 0, easy: 0 } }).as('getStats');
    cy.intercept('GET', '**/napicsepp/activities', { statusCode: 200, body: [] }).as('getActivities');
    cy.intercept('GET', '**/napicsepp/activities/habits', { statusCode: 200, body: [] }).as('getHabits');
    cy.intercept('GET', '**/napicsepp/events**', { statusCode: 200, body: [] }).as('getEvents');

    cy.get('input[type="text"]').type('TesztUser');
    cy.get('input[type="email"]').type('test@test.hu');
    cy.get('input[type="password"]').first().type('jelszo123');
    cy.get('input[type="password"]').last().type('jelszo123');
    cy.get('.register-button-div button[type="submit"]').click();

    cy.wait('@regOk');
    cy.url().should('not.include', '/register');
  });

  it('15 - Megjeleníti a regisztrációs képet', () => {
    cy.get('.register-image-div img').should('be.visible');
  });
});
