/// <reference types="cypress" />

describe('Profil oldal', () => {
  beforeEach(() => {
    cy.visitProtected('/profile');
  });

  it('1 - Profil oldal betöltődik', () => {
    cy.get('.profile-section').should('be.visible');
  });

  it('2 - Profil cím megjelenik', () => {
    cy.get('.info-text-div h2').should('contain.text', 'Profil');
  });

  it('3 - Profil alcím megjelenik', () => {
    cy.get('.info-text-div p').should('contain.text', 'profil');
  });

  it('4 - Profil kártya megjelenik a felhasználónévvel', () => {
    cy.get('.profile-card-div').should('be.visible');
    cy.get('.username').should('contain.text', 'testuser');
  });

  it('5 - Email cím megjelenik', () => {
    cy.contains('test@test.hu').should('exist');
  });

  it('6 - Jelszó mező (rejtett) megjelenik', () => {
    cy.contains('••••••••').should('exist');
  });

  it('7 - Fiók típus megjelenik', () => {
    cy.contains('Felhasználó').should('exist');
  });

  it('8 - Regisztráció dátuma megjelenik', () => {
    cy.contains('2025-01-01').should('exist');
  });

  it('9 - Adatok szerkesztése gomb megjelenik', () => {
    cy.get('.edit-profile-btn').should('be.visible').and('contain.text', 'Adatok szerkesztése');
  });

  it('10 - Szerkesztés gombra kattintva popup megjelenik', () => {
    cy.get('.edit-profile-btn').click();
    cy.get('.edit-popup-overlay').should('be.visible');
    cy.get('.edit-popup-card').should('be.visible');
  });

  it('11 - Szerkesztés popup tartalmaz felhasználónév mezőt', () => {
    cy.get('.edit-profile-btn').click();
    cy.get('.edit-popup-card input[type="text"]').should('have.value', 'TestUser');
  });

  it('12 - Szerkesztés popup tartalmaz email mezőt', () => {
    cy.get('.edit-profile-btn').click();
    cy.get('.edit-popup-card input[type="email"]').should('have.value', 'test@test.hu');
  });

  it('13 - Szerkesztés popup bezárható X gombbal', () => {
    cy.get('.edit-profile-btn').click();
    cy.get('.edit-popup-close').click();
    cy.get('.edit-popup-overlay').should('not.exist');
  });

  it('14 - Szerkesztés popup bezárható Mégse gombbal', () => {
    cy.get('.edit-profile-btn').click();
    cy.get('.edit-cancel-btn').click();
    cy.get('.edit-popup-overlay').should('not.exist');
  });

  it('15 - Profil statisztikák szekció megjelenik 4 kártyával', () => {
    cy.get('.profile-stats-div').should('be.visible');
    cy.get('.stats-grid').should('be.visible');
    cy.get('.stats-grid [class*="stat-"]').should('have.length.gte', 4);
  });
});

describe('Profil szerkesztés popup (részletes)', () => {
  beforeEach(() => {
    cy.visitProtected('/profile');
    cy.get('.edit-profile-btn').click();
    cy.get('.edit-popup-card').should('be.visible');
  });

  it('16 - Popup fejléc "Adatok szerkesztése" szöveget mutat', () => {
    cy.get('.edit-popup-header h3').should('contain.text', 'Adatok szerkesztése');
  });

  it('17 - Jelszó mező megjelenik és üres', () => {
    cy.get('.edit-popup-card input[type="password"]').should('exist').and('have.value', '');
  });

  it('18 - Jelszó mező placeholder szövege "Új jelszó"', () => {
    cy.get('.edit-popup-card input[type="password"]').should('have.attr', 'placeholder', 'Új jelszó');
  });

  it('19 - Felhasználónév mező módosítható', () => {
    cy.get('.edit-popup-card input[type="text"]').clear().type('ÚjNév').should('have.value', 'ÚjNév');
  });

  it('20 - Email mező módosítható', () => {
    cy.get('.edit-popup-card input[type="email"]').clear().type('uj@email.hu').should('have.value', 'uj@email.hu');
  });

  it('21 - Mentés gomb megjelenik "Mentés" szöveggel', () => {
    cy.get('.edit-save-btn').should('be.visible').and('contain.text', 'Mentés');
  });

  it('22 - Mégse gomb megjelenik', () => {
    cy.get('.edit-cancel-btn').should('be.visible').and('contain.text', 'Mégse');
  });

  it('23 - Mentés gomb kattintás PUT kérést küld', () => {
    cy.get('.edit-save-btn').click();
    cy.wait('@updateProfile');
  });

  it('24 - Overlay-re kattintás bezárja a popupot', () => {
    cy.get('.edit-popup-overlay').click({ force: true });
    cy.get('.edit-popup-card').should('not.exist');
  });

  it('25 - Opcionális jelszó megjegyzés megjelenik', () => {
    cy.get('.optional-label').should('contain.text', 'hagyja üresen');
  });
});
