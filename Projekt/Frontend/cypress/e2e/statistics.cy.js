/// <reference types="cypress" />

describe('Statisztikák oldal', () => {
  beforeEach(() => {
    cy.visitProtected('/statistics');
  });

  it('1 - Statisztikák oldal betöltődik', () => {
    cy.get('.statistics-section').should('be.visible');
  });

  it('2 - Info szöveg (Statisztikák cím) megjelenik', () => {
    cy.get('.info-text-div').should('contain.text', 'Statisztikák');
  });

  it('3 - Alcím szöveg megjelenik', () => {
    cy.get('.info-text-div').should('contain.text', 'teljesítmény');
  });

  it('4 - Négy számláló kártya megjelenik', () => {
    cy.get('.counters-div .counter-div').should('have.length', 4);
  });

  it('5 - Összes feladat számláló megjelenik', () => {
    cy.get('.counter-div.allTasks .counter-value').should('be.visible').and('not.be.empty');
  });

  it('6 - Befejezett feladatok számláló megjelenik', () => {
    cy.get('.counter-div.completed .counter-value').should('be.visible');
  });

  it('7 - Események számláló megjelenik', () => {
    cy.get('.counter-div.events .counter-value').should('be.visible');
  });

  it('8 - Aktív szokások számláló megjelenik', () => {
    cy.get('.counter-div.active .counter-value').should('be.visible');
  });

  it('9 - Befejezési arány szekció megjelenik', () => {
    cy.get('.averages-div').should('be.visible');
    cy.get('.averages-div').should('contain.text', 'Befejezési arány');
  });

  it('10 - Progress bar megjelenik a befejezési arányban', () => {
    cy.get('.progress-bar').should('be.visible');
    cy.get('.progress-fill').should('exist');
  });

  it('11 - Százalék érték megjelenik', () => {
    cy.get('.progress-percent').invoke('text').should('match', /\d+%/);
  });

  it('12 - Befejezett / Függőben arány megjelenik', () => {
    cy.get('.ratio-div').should('be.visible');
    cy.get('.completed-div').should('contain.text', 'Befejezett');
    cy.get('.pending-div').should('contain.text', 'Függőben');
  });

  it('13 - Nehézségek eloszlása szekció megjelenik', () => {
    cy.get('.priority-stats-div').should('be.visible');
    cy.get('.priority-item').should('have.length', 3);
  });

  it('14 - Heti összesítő szekció megjelenik', () => {
    cy.get('.habit-stats-div').should('be.visible');
    cy.get('.habit-stats-div').should('contain.text', 'Heti összesítő');
  });

  it('15 - Heti áttekintés diagram és számlálók megjelennek', () => {
    cy.get('.weekly-overview-div').should('be.visible');
    cy.get('.chart-container').should('be.visible');
    cy.get('.chart-bar-group').should('have.length', 7);
    cy.get('.diagram-counters-div .weekly-stat-display').should('have.length', 3);
  });

  // ── Pontos stat értékek ellenőrzése ────────────────────

  it('16 - Összes feladat számláló helyes (12)', () => {
    cy.get('.counter-div.allTasks .counter-value').should('contain.text', '12');
  });

  it('17 - Befejezett feladatok számláló helyes (8)', () => {
    cy.get('.counter-div.completed .counter-value').should('contain.text', '8');
  });

  it('18 - Események számláló helyes (5)', () => {
    cy.get('.counter-div.events .counter-value').should('contain.text', '5');
  });

  it('19 - Aktív szokások számláló helyes (1)', () => {
    cy.get('.counter-div.active .counter-value').should('contain.text', '1');
  });

  it('20 - Befejezési arány százalék helyes (67%)', () => {
    cy.get('.progress-percent').should('contain.text', '67%');
  });

  it('21 - Befejezett szám a ratio-div-ben helyes (8)', () => {
    cy.get('.completed-div .ratio-value').should('contain.text', '8');
  });

  it('22 - Függőben szám a ratio-div-ben helyes (4)', () => {
    cy.get('.pending-div .ratio-value').should('contain.text', '4');
  });

  it('23 - Magas nehézség szám helyes (3)', () => {
    cy.get('.high-difficulty .priority-value').should('contain.text', '3');
  });

  it('24 - Közepes nehézség szám helyes (5)', () => {
    cy.get('.mid-difficulty .priority-value').should('contain.text', '5');
  });

  it('25 - Alacsony nehézség szám helyes (4)', () => {
    cy.get('.low-difficulty .priority-value').should('contain.text', '4');
  });

  it('26 - Heti összesítő: összes feladat megjelenik', () => {
    cy.get('.habit-stats-div .habit-value').first().should('exist');
  });

  it('27 - Heti összesítő: befejezett megjelenik', () => {
    cy.get('.habit-stats-div').should('contain.text', 'Heti befejezett');
  });

  it('28 - Heti összesítő: függőben megjelenik', () => {
    cy.get('.habit-stats-div').should('contain.text', 'Heti függőben');
  });

  it('29 - Napi átlag megjelenik', () => {
    cy.get('.habit-average-display').should('exist');
    cy.get('.habit-average-display').should('contain.text', 'Napi átlag');
  });

  it('30 - Heti diagram 7 oszlopot tartalmaz (H-V)', () => {
    cy.get('.chart-label').should('have.length', 7);
    cy.get('.chart-label').first().should('contain.text', 'H');
    cy.get('.chart-label').last().should('contain.text', 'V');
  });

  it('31 - Diagram legend tartalmazza az Elvégzett és Függőben címkéket', () => {
    cy.get('.chart-legend .legend-item').should('have.length', 2);
    cy.get('.chart-legend').should('contain.text', 'Elvégzett');
    cy.get('.chart-legend').should('contain.text', 'Függőben');
  });

  it('32 - Diagram számlálók 3 értéket mutatnak (összes, elvégzett, átlag)', () => {
    cy.get('.diagram-counters-div .weekly-stat-display').should('have.length', 3);
    cy.get('.diagram-counters-div').should('contain.text', 'Heti összes');
    cy.get('.diagram-counters-div').should('contain.text', 'Elvégzett');
    cy.get('.diagram-counters-div').should('contain.text', 'Átlag');
  });

  it('33 - Counter description szövegek megjelennek', () => {
    cy.get('.counter-div.allTasks .counter-desc').should('contain.text', 'Teendők');
    cy.get('.counter-div.completed .counter-desc').should('contain.text', 'Elvégzett');
    cy.get('.counter-div.events .counter-desc').should('contain.text', 'Naptári');
    cy.get('.counter-div.active .counter-desc').should('contain.text', 'Aktív');
  });

  it('34 - Counter label szövegek megjelennek', () => {
    cy.get('.counter-div.allTasks .counter-label').should('contain.text', 'Összes feladat');
    cy.get('.counter-div.completed .counter-label').should('contain.text', 'Befejezett');
    cy.get('.counter-div.events .counter-label').should('contain.text', 'Összes események');
    cy.get('.counter-div.active .counter-label').should('contain.text', 'Aktív szokások');
  });

  it('35 - Progress bar fill szélessége nem nulla', () => {
    cy.get('.progress-fill').should('have.attr', 'style').and('not.contain', 'width: 0%');
  });
});
