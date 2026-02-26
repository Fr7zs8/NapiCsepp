/// <reference types="cypress" />

describe('Sidebar és Navigáció', () => {
  beforeEach(() => {
    cy.visitProtected('/');
  });

  it('1 - Sidebar megjelenik', () => {
    cy.get('.sidebar').should('exist');
  });

  it('2 - Brand (NapiCsepp) megjelenik a sidebarban', () => {
    cy.get('.brand-text').should('contain.text', 'NapiCsepp');
  });

  it('3 - Droplet ikon megjelenik a brand mellett', () => {
    cy.get('.brand-drop').should('exist');
  });

  it('4 - Főoldal link megjelenik', () => {
    cy.get('.sidebar-link').contains('Főoldal').should('exist');
  });

  it('5 - Profil link megjelenik', () => {
    cy.get('.sidebar-link').contains('Profil').should('exist');
  });

  it('6 - Statisztika link megjelenik', () => {
    cy.get('.sidebar-link').contains('Statisztika').should('exist');
  });

  it('7 - Naptár link megjelenik', () => {
    cy.get('.sidebar-link').contains('Naptár').should('exist');
  });

  it('8 - Feladatok link megjelenik', () => {
    cy.get('.sidebar-link').contains('Feladatok').should('exist');
  });

  it('9 - Szokások link megjelenik', () => {
    cy.get('.sidebar-link').contains('Szokások').should('exist');
  });

  it('10 - Főoldal link aktív a / útvonalon', () => {
    cy.get('.sidebar-link.active').should('contain.text', 'Főoldal');
  });

  it('11 - Profil linkre kattintás navigál /profile-ra', () => {
    cy.get('.sidebar-link').contains('Profil').click();
    cy.url().should('include', '/profile');
  });

  it('12 - Statisztika linkre kattintás navigál /statistics-ra', () => {
    cy.visitProtected('/');
    cy.get('.sidebar-link').contains('Statisztika').click();
    cy.url().should('include', '/statistics');
  });

  it('13 - Kijelentkezés gomb megjelenik a sidebar footerben', () => {
    cy.get('.sidebar-footer .sidebar-link').should('contain.text', 'Kijelentkezés');
  });

  it('14 - Kijelentkezés gombra kattintás átirányít /login-re', () => {
    cy.get('.sidebar-footer .sidebar-link').contains('Kijelentkezés').click();
    cy.url().should('include', '/login');
  });

  it('15 - Mini profil szekció megjelenik a felhasználónévvel', () => {
    cy.get('.sidebar-mini-profile').should('be.visible');
    cy.get('.mini-profile-username').should('contain.text', 'testuser');
  });
});

describe('Layout struktúra', () => {
  beforeEach(() => {
    cy.visitProtected('/');
  });

  it('1 - Layout tartalmazza a sidebar-t és a main tartalmat', () => {
    cy.get('.layout').should('exist');
    cy.get('.sidebar').should('exist');
    cy.get('.main-content').should('exist');
  });

  it('2 - Main content a megfelelő osztállyal rendelkezik', () => {
    cy.get('main.main-content').should('be.visible');
  });

  it('3 - Sidebar kategóriák megjelennek', () => {
    cy.get('.sidebar-category').should('have.length.gte', 2);
  });

  it('4 - Sidebar dividerek megjelennek', () => {
    cy.get('.sidebar-divider').should('have.length.gte', 2);
  });

  it('5 - Hamburger gomb létezik (mobilon)', () => {
    cy.get('.hamburger-btn').should('exist');
  });
});

describe('Védett útvonalak (Protected routes)', () => {
  it('1 - Token nélkül a főoldal átirányít /login-re', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('2 - Token nélkül a /profile átirányít /login-re', () => {
    cy.visit('/profile');
    cy.url().should('include', '/login');
  });

  it('3 - Token nélkül a /statistics átirányít /login-re', () => {
    cy.visit('/statistics');
    cy.url().should('include', '/login');
  });

  it('4 - Token nélkül a /calendar/monthly átirányít /login-re', () => {
    cy.visit('/calendar/monthly');
    cy.url().should('include', '/login');
  });

  it('5 - Token nélkül a /tasks átirányít /login-re', () => {
    cy.visit('/tasks');
    cy.url().should('include', '/login');
  });
});
