/// <reference types="cypress" />

describe('Naptár - Havi nézet (Monthly)', () => {
  beforeEach(() => {
    cy.visitProtected('/calendar/monthly');
  });

  it('1 - Megjeleníti a havi nézet szekciót', () => {
    cy.get('.monthly-calendar-view').should('be.visible');
  });

  it('2 - Header tartalmazza a hónap nevét', () => {
    cy.get('.info-text-div').should('contain.text', '2026');
  });

  it('3 - Navigációs gombok megjelennek (Vissza, előre, hátra)', () => {
    cy.get('.navigation-buttons button').should('have.length.gte', 3);
  });

  it('4 - Nézet váltó (switch) megjelenik', () => {
    cy.get('.view-switch-small').should('be.visible');
    cy.get('.view-switch-small label').should('have.length.gte', 2);
  });

  it('5 - Hónap gomb aktív a havi nézetben', () => {
    cy.get('#view-month').should('be.checked');
  });

  it('6 - Naptár rács megjelenik a napokkal', () => {
    cy.get('.calendar-grid').should('be.visible');
  });

  it('7 - Hét napjai fejléc megjelenik (H, K, Sze...)', () => {
    cy.get('.day-header').should('have.length', 7);
  });

  it('8 - Vissza gomb működik', () => {
    cy.get('.navigation-buttons button').first().click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('9 - Hét nézetre váltás működik', () => {
    cy.get('label[for="view-week"]').click();
    cy.url().should('include', '/calendar/weekly');
  });
});

describe('Naptár - Havi nézet popupok és CRUD', () => {
  beforeEach(() => {
    cy.visitProtected('/calendar/monthly');
  });

  it('16 - Mai napra kattintás popup-ot nyit', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-overlay').should('be.visible');
    cy.get('.popup-content').should('be.visible');
  });

  it('17 - Nap popup tartalmazza a dátumot', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-header h2').should('not.be.empty');
  });

  it('18 - Nap popup 3 fület tartalmaz (Események, Feladatok, Szokások)', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-tab').should('have.length', 3);
    cy.get('.popup-tab').eq(0).should('contain.text', 'Események');
    cy.get('.popup-tab').eq(1).should('contain.text', 'Feladatok');
    cy.get('.popup-tab').eq(2).should('contain.text', 'Szokások');
  });

  it('19 - Események fül aktív alapértelmezetten', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-tab').eq(0).should('have.class', 'active');
  });

  it('20 - Feladatok fülre kattintás átvált', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-tab').eq(1).click();
    cy.get('.popup-tab').eq(1).should('have.class', 'active');
  });

  it('21 - Szokások fülre kattintás átvált', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-tab').eq(2).click();
    cy.get('.popup-tab').eq(2).should('have.class', 'active');
  });

  it('22 - "Új esemény hozzáadása" gomb megjelenik az Események fülön', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-actions .btn-save').should('contain.text', 'Új esemény hozzáadása');
  });

  it('23 - "Új esemény hozzáadása" gombra kattintás EventPopup-ot nyit', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-actions .btn-save').click();
    // Az EventPopup is popup-overlay-t használ
    cy.get('.popup-overlay').should('be.visible');
    cy.get('.popup-form').should('be.visible');
  });

  it('24 - EventPopup tartalmaz név mezőt', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-actions .btn-save').click();
    cy.get('#event-name').should('be.visible');
  });

  it('25 - EventPopup tartalmaz dátum, kezdés, befejezés mezőket', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-actions .btn-save').click();
    cy.get('#event-date').should('exist');
    cy.get('#start-time').should('exist');
    cy.get('#end-time').should('exist');
  });

  it('26 - EventPopup "Létrehozás" gomb megjelenik új eseménynél', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-actions .btn-save').click();
    cy.get('.popup-form .btn-save').should('contain.text', 'Létrehozás');
  });

  it('27 - EventPopup "Mégse" gomb bezárja a popupot', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-actions .btn-save').click();
    cy.get('.popup-form .btn-cancel').click();
    cy.get('.popup-form').should('not.exist');
  });

  it('28 - Nap popup bezárható X gombbal', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-content .close-btn').click();
    cy.get('.popup-content').should('not.exist');
  });

  it('29 - Feladatok fülön "Új feladat hozzáadása" link navigál /tasks-ra', () => {
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-tab').eq(1).click();
    cy.get('.popup-link').click();
    cy.url().should('include', '/tasks');
  });

  it('30 - Szokások fülön "Új szokás hozzáadása" link navigál /habits-ra', () => {
    cy.visitProtected('/calendar/monthly');
    cy.get('.calendar-day.current-day').click();
    cy.get('.popup-tab').eq(2).click();
    cy.get('.popup-link').click();
    cy.url().should('include', '/habits');
  });

  it('31 - Jelmagyarázat szekció megjelenik', () => {
    cy.get('.explanation-div').should('be.visible');
    cy.get('.calendar-legend').should('contain.text', 'Események');
    cy.get('.calendar-legend').should('contain.text', 'Teendők');
    cy.get('.calendar-legend').should('contain.text', 'Szokások');
  });

  it('32 - Előre hónap gomb működik', () => {
    cy.get('.navigation-buttons button').eq(2).click();
    cy.get('.month-name').should('contain.text', 'március');
  });

  it('33 - Hátra hónap gomb működik', () => {
    cy.get('.navigation-buttons button').eq(1).click();
    cy.get('.month-name').should('contain.text', 'január');
  });
});

describe('Naptár - Heti nézet (Weekly)', () => {
  beforeEach(() => {
    cy.visitProtected('/calendar/weekly');
  });

  it('10 - Megjeleníti a heti nézet szekciót', () => {
    cy.get('.weekly-calendar-view').should('be.visible');
  });

  it('11 - 7 nap oszlop megjelenik', () => {
    cy.get('.day-column').should('have.length', 7);
  });

  it('12 - Fejléc cellák tartalmazzák a napokat', () => {
    cy.get('.day-header-cell .day-name').should('have.length.gte', 7);
  });

  it('13 - Idősávok megjelennek (00:00 - 23:00)', () => {
    cy.get('.time-cell').should('have.length.gte', 12);
    cy.get('.time-cell').first().should('contain.text', '00:00');
  });

  it('14 - Mai nap kiemelve jelenik meg', () => {
    cy.get('.day-header-cell.current-day').should('exist');
  });

  it('15 - Hónap nézetre váltás működik', () => {
    cy.get('label[for="view-month"]').click();
    cy.url().should('include', '/calendar/monthly');
  });
});

describe('Naptár - Combined nézet (mobil)', () => {
  beforeEach(() => {
    cy.viewport(375, 812); // mobil méret
    cy.visitProtected('/calendar/combined');
  });

  it('34 - Combined nézet szekció megjelenik', () => {
    cy.get('.combined-calendar-view').should('be.visible');
  });

  it('35 - Hét napjai kártyák megjelennek', () => {
    cy.get('.week-grid .day-card').should('have.length', 7);
  });

  it('36 - Mai nap kiemelve jelenik meg', () => {
    cy.get('.day-card.current-day').should('exist');
  });

  it('37 - Nap kártyára kattintás események listáját mutatja', () => {
    cy.get('.day-card').first().click();
    // EventsListPopup jelenik meg (inline styled overlay)
    cy.contains('Események').should('be.visible');
  });

  it('38 - Események lista popup bezárható', () => {
    cy.get('.day-card').first().click();
    cy.contains('Bezár').click();
  });

  it('39 - Idősávok megjelennek a napi nézetben (00:00-tól)', () => {
    cy.get('.time-slots').should('exist');
  });

  it('40 - Napi beosztás fejléc megjeleníti a kiválasztott napot', () => {
    cy.get('.schedule-header').should('not.be.empty');
  });

  it('41 - Navigációs gombok megjelennek (Vissza, előre, hátra)', () => {
    cy.get('.navigation-buttons button').should('have.length.gte', 3);
  });

  it('42 - Hónap nézetre váltás gomb működik', () => {
    cy.get('label[for="view-month"]').click();
    cy.url().should('include', '/calendar/monthly');
  });

  it('43 - Előre hét gomb változtatja a hetet', () => {
    cy.get('.day-card .day-date').first().invoke('text').then(originalDate => {
      cy.get('.navigation-buttons button').eq(2).click();
      cy.get('.day-card .day-date').first().invoke('text').should('not.eq', originalDate);
    });
  });

  it('44 - Idősávra kattintás EventPopup-ot nyit', () => {
    // kattints az első idősáv területre
    cy.get('.time-slots').find('[style*="cursor: pointer"]').first().click({ force: true });
    cy.get('.popup-overlay').should('be.visible');
    cy.get('.popup-form').should('be.visible');
  });

  it('45 - EventPopup bezárható Mégse gombbal combined nézetben', () => {
    cy.get('.time-slots').find('[style*="cursor: pointer"]').first().click({ force: true });
    cy.get('.btn-cancel').click();
    cy.get('.popup-form').should('not.exist');
  });
});

// ═══════════════════════════════════════════════════════════
// Napi nézet (Daily View)
// ═══════════════════════════════════════════════════════════

describe('Naptár - Napi nézet (Daily)', () => {
  beforeEach(() => {
    cy.visitProtected('/calendar/daily');
  });

  it('46 - Napi nézet betöltődik', () => {
    cy.get('.day-calendar-section').should('be.visible');
  });

  it('47 - Dátum szöveg megjelenik', () => {
    cy.get('.info-text-div p').should('contain.text', '2026');
  });

  it('48 - Navigációs gombok megjelennek (Vissza, balra, jobbra)', () => {
    cy.get('.navigation-buttons button').should('have.length', 3);
  });

  it('49 - Vissza gomb a főoldalra navigál', () => {
    cy.get('.navigation-buttons button').first().click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('50 - Nézet váltó gombok megjelennek (Hónap, Hét, Nap)', () => {
    cy.get('.view-switch-small').should('exist');
    cy.get('.view-switch-small label').should('have.length.gte', 3);
  });

  it('51 - Nap radio button aktív', () => {
    cy.get('#view-day').should('be.checked');
  });

  it('52 - Hónap radio kattintás navigál a monthly nézetbe', () => {
    cy.get('label[for="view-month"]').click();
    cy.url().should('include', '/calendar/monthly');
  });

  it('53 - Day timeline megjelenik 24 órával', () => {
    cy.visitProtected('/calendar/daily');
    cy.get('.day-timeline').should('exist');
  });

  it('54 - Időslotok szövege az órákat mutatja (00:00 - 23:00)', () => {
    cy.get('.day-timeline').should('contain.text', '00:00');
    cy.get('.day-timeline').should('contain.text', '12:00');
  });

  it('55 - Esemény blokk megjelenik, ha van esemény', () => {
    cy.get('.event-block-daily').should('have.length.gte', 1);
  });

  it('56 - Esemény blokk tartalmazza az esemény nevét', () => {
    cy.get('.event-block-daily .event-name').should('contain.text', 'Teszt esemény');
  });

  it('57 - Esemény blokk tartalmazza az időt', () => {
    cy.get('.event-block-daily .event-time').should('exist');
  });

  it('58 - Mai nap info szöveg current-day osztályt kap', () => {
    cy.get('.info-text-div.current-day').should('exist');
  });

  it('59 - Előre navigáció (jobb nyíl) másik napot mutat', () => {
    cy.get('.info-text-div p').invoke('text').then((originalText) => {
      cy.get('.navigation-buttons button').eq(2).click();
      cy.get('.info-text-div p').invoke('text').should('not.eq', originalText);
    });
  });

  it('60 - Hátra navigáció (bal nyíl) tegnapi napot mutat', () => {
    cy.get('.info-text-div p').invoke('text').then((originalText) => {
      cy.get('.navigation-buttons button').eq(1).click();
      cy.get('.info-text-div p').invoke('text').should('not.eq', originalText);
    });
  });
});
