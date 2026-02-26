/// <reference types="cypress" />

describe('Homepage / Főoldal', () => {
  beforeEach(() => {
    cy.visitProtected('/');
  });

  it('1 - Megjeleníti a főoldalt (section elem)', () => {
    cy.get('section').should('exist');
  });

  it('2 - Üdvözli a felhasználót a nevével', () => {
    cy.get('.info-text-div h3').should('contain.text', 'Szia');
  });

  it('3 - Megjeleníti a mai dátumot', () => {
    cy.get('.stat-header-text').should('contain.text', '2026');
  });

  it('4 - Megjeleníti a progress bar-t', () => {
    cy.get('.progress-view-div').should('be.visible');
    cy.get('.progress-bar').should('exist');
    cy.get('.progress-bar-fill').should('exist');
  });

  it('5 - A progress badge százalékot mutat', () => {
    cy.get('.progress-badge').invoke('text').should('match', /\d+%/);
  });

  it('6 - A progress mérföldkövek (milestones) megjelennek', () => {
    cy.get('.progress-milestones span').should('have.length', 5);
    cy.get('.progress-milestones').should('contain.text', '0%').and('contain.text', '100%');
  });

  it('7 - Motivációs szöveg megjelenik', () => {
    cy.get('.progress-motivation').should('be.visible').and('not.be.empty');
  });

  it('8 - A szöveg karusszel megjelenik', () => {
    cy.get('.text-carousel-div').should('be.visible');
    cy.get('.carousel-text').should('not.be.empty');
  });

  it('9 - A karusszel pontok megjelennek és egy aktív', () => {
    cy.get('.carousel-dots .dot').should('have.length.greaterThan', 1);
    cy.get('.carousel-dots .dot.active').should('have.length', 1);
  });

  it('10 - Gyors hozzáférés szekció megjelenik 3 kártyával', () => {
    cy.get('.quick-access-section').should('be.visible');
    cy.get('.quick-access-list-div .access-div').should('have.length', 3);
  });

  it('11 - Naptár kártya kattintás a /calendar/monthly oldalra navigál', () => {
    cy.get('.access-div.calendar').click();
    cy.url().should('include', '/calendar/monthly');
  });

  it('12 - Feladatok kártya kattintás a /tasks oldalra navigál', () => {
    cy.visitProtected('/');
    cy.get('.access-div.tasks').click();
    cy.url().should('include', '/tasks');
  });

  it('13 - Szokások kártya kattintás a /habits oldalra navigál', () => {
    cy.visitProtected('/');
    cy.get('.access-div.habits').click();
    cy.url().should('include', '/habits');
  });

  it('14 - Statisztikák szekció megjelenik a 4 stat kártyával', () => {
    cy.get('.todays-statistics-section').should('be.visible');
    cy.get('.statistics-list-div .stat-div').should('have.length', 4);
  });

  it('15 - Stat kártyák tartalmazzák a megfelelő címkéket', () => {
    cy.get('.stat-div.tasks .stat-name').should('contain.text', 'Feladatok');
    cy.get('.stat-div.finished .stat-name').should('contain.text', 'Befejezett');
    cy.get('.stat-div.events .stat-name').should('contain.text', 'Események');
    cy.get('.stat-div.habits .stat-name').should('contain.text', 'Szokások');
  });

  // ── Stat értékek ellenőrzése ──────────────────────────

  it('16 - Összes feladatok szám helyes (12 db)', () => {
    cy.get('.stat-div.tasks .stat-value').should('contain.text', '12');
  });

  it('17 - Befejezett feladatok arány helyes (8 / 12)', () => {
    cy.get('.stat-div.finished .stat-value').should('contain.text', '8');
    cy.get('.stat-div.finished .stat-value').should('contain.text', '12');
  });

  it('18 - Események szám helyes (5 db)', () => {
    cy.get('.stat-div.events .stat-value').should('contain.text', '5');
  });

  it('19 - Aktív szokások szám helyes (1 db)', () => {
    cy.get('.stat-div.habits .stat-value').should('contain.text', '1');
  });

  it('20 - Progress badge a helyes completionRate-et mutatja (67%)', () => {
    cy.get('.progress-badge').should('contain.text', '67%');
  });

  it('21 - Progress bar fill szélessége nem 0%', () => {
    cy.get('.progress-bar-fill').should('have.attr', 'style').and('not.contain', 'width: 0%');
  });

  it('22 - Motivációs szöveg a completionRate-nek megfelelő', () => {
    // 67% → "Már félúton jársz" (50-74% sáv)
    cy.get('.progress-motivation').should('contain.text', 'félúton');
  });

  it('23 - Stat kártyák label címkéi megjelennek', () => {
    cy.get('.stat-label.purple').should('contain.text', 'Összes');
    cy.get('.stat-label.green').should('contain.text', 'Kész');
    cy.get('.stat-label.blue').should('contain.text', 'Mostanában');
    cy.get('.stat-label.pink').should('contain.text', 'Aktív');
  });

  it('24 - Statisztikák szekció fejléce megjelenik', () => {
    cy.get('.statistics-header h3').should('contain.text', 'Mai statisztikák');
  });

  it('25 - Statisztikák szekció alcíme megjelenik', () => {
    cy.get('.todays-statistics-section').should('contain.text', 'pillantásra');
  });
});
