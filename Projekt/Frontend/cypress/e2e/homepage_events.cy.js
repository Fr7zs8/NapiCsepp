/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════
// Homepage — Mai események & Közelgő események e2e tesztek
// ═══════════════════════════════════════════════════════════

const today = new Date();
const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

// Helper: tomorrow string
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

// Helper: day after tomorrow
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);
const dayAfterStr = dayAfter.toISOString().split('T')[0];

const todayEvents = [
  {
    event_id: 100,
    event_name: 'Mai reggeli meeting',
    event_start_time: `${todayStr}T08:00:00`,
    event_end_time: `${todayStr}T09:00:00`,
  },
  {
    event_id: 101,
    event_name: 'Mai ebédszünet',
    event_start_time: `${todayStr}T12:00:00`,
    event_end_time: `${todayStr}T13:00:00`,
  },
];

const futureEvents = [
  {
    event_id: 200,
    event_name: 'Holnapi prezentáció',
    event_start_time: `${tomorrowStr}T10:00:00`,
    event_end_time: `${tomorrowStr}T11:30:00`,
  },
  {
    event_id: 201,
    event_name: 'Holnapután workshop',
    event_start_time: `${dayAfterStr}T14:00:00`,
    event_end_time: `${dayAfterStr}T16:00:00`,
  },
];

const allEvents = [...todayEvents, ...futureEvents];

// ── DESCRIBE: Mai események (today) ──────────────────────

describe('Homepage — Mai események lista', () => {
  beforeEach(() => {
    cy.fakeLogin();
    cy.stubApi();
    // Override events to include today + future events
    cy.intercept('GET', '**/napicsepp/events**', {
      statusCode: 200,
      body: allEvents,
    }).as('getEventsHome');
    cy.visit('/');
    cy.wait('@getEventsHome');
  });

  it('1 - Mai események szekció megjelenik', () => {
    cy.get('.upcoming-events-section').first().should('be.visible');
    cy.get('.upcoming-events-section').first().should('contain.text', 'Mai események');
  });

  it('2 - Mai események számláló helyes', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-events-count')
      .should('contain.text', `${todayEvents.length} esemény`);
  });

  it('3 - Mai események listában megjelenik minden mai esemény neve', () => {
    cy.get('.upcoming-events-section').first().within(() => {
      todayEvents.forEach(ev => {
        cy.get('.upcoming-event-name').should('contain.text', ev.event_name);
      });
    });
  });

  it('4 - Mai események listában megjelenik az időpont', () => {
    cy.get('.upcoming-events-section').first().within(() => {
      cy.get('.upcoming-event-time').should('have.length', todayEvents.length);
      cy.get('.upcoming-event-time').first().should('not.be.empty');
    });
  });

  it('5 - Mai esemény kártyán megjelenik a pont és a nyíl ikon', () => {
    cy.get('.upcoming-events-section').first().within(() => {
      cy.get('.upcoming-event-dot').should('have.length', todayEvents.length);
      cy.get('.upcoming-event-arrow').should('have.length', todayEvents.length);
    });
  });

  it('6 - Mai eseményre kattintás megnyitja a mini popupot', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').should('be.visible');
  });

  it('7 - Mini popup tartalmaz Szerkesztés, Törlés, Bezár gombokat', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').within(() => {
      cy.contains('Szerkesztés').should('be.visible');
      cy.contains('Törlés').should('be.visible');
      cy.contains('Bezár').should('be.visible');
    });
  });

  it('8 - Mini popup Bezár gomb bezárja a popupot', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').should('be.visible');
    cy.get('.mini-popup').contains('Bezár').click();
    cy.get('.mini-popup').should('not.exist');
  });

  it('9 - Mini popup Szerkesztés megnyitja az EventPopupot', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').contains('Szerkesztés').click();
    cy.get('.popup-form').should('be.visible');
  });

  it('10 - EventPopup Mégse gomb bezárja a szerkesztőt', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').contains('Szerkesztés').click();
    cy.get('.popup-form .btn-cancel').click();
    cy.get('.popup-form').should('not.exist');
  });

  it('11 - Mini popup Törlés DELETE kérést küld', () => {
    // The service calls DELETE /napicsepp/event/:id (singular)
    cy.intercept('DELETE', '**/napicsepp/event/**', { statusCode: 200, body: { success: true } }).as('deleteEventSingular');
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').contains('Törlés').click();
    cy.wait('@deleteEventSingular');
  });
});

// ── DESCRIBE: Közelgő események (future) ─────────────────

describe('Homepage — Közelgő események lista', () => {
  beforeEach(() => {
    cy.fakeLogin();
    cy.stubApi();
    cy.intercept('GET', '**/napicsepp/events**', {
      statusCode: 200,
      body: allEvents,
    }).as('getEventsHome');
    cy.visit('/');
    cy.wait('@getEventsHome');
  });

  it('12 - Közelgő események szekció megjelenik', () => {
    cy.get('.upcoming-events-section').eq(1).should('be.visible');
    cy.get('.upcoming-events-section').eq(1).should('contain.text', 'Közelgő események');
  });

  it('13 - Közelgő események számláló helyes', () => {
    // future events = all events where start > now
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-events-count')
      .invoke('text')
      .should('match', /\d+ esemény/);
  });

  it('14 - Közelgő események listában megjelennek az események nevei', () => {
    cy.get('.upcoming-events-section').eq(1).within(() => {
      futureEvents.forEach(ev => {
        cy.get('.upcoming-event-name').should('contain.text', ev.event_name);
      });
    });
  });

  it('15 - Közelgő események listában megjelenik dátum és időpont', () => {
    cy.get('.upcoming-events-section').eq(1).within(() => {
      cy.get('.upcoming-event-time').should('have.length.gte', 1);
      cy.get('.upcoming-event-time').first().should('not.be.empty');
    });
  });

  it('16 - Közelgő eseményre kattintás megnyitja a mini popupot', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').should('be.visible');
  });

  it('17 - Mini popup Szerkesztés megnyitja az EventPopupot', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').contains('Szerkesztés').click();
    cy.get('.popup-form').should('be.visible');
  });

  it('18 - Mini popup Törlés DELETE kérést küld', () => {
    cy.intercept('DELETE', '**/napicsepp/event/**', { statusCode: 200, body: { success: true } }).as('deleteEventSingular');
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').contains('Törlés').click();
    cy.wait('@deleteEventSingular');
  });

  it('19 - Mini popup Bezár bezárja a popupot', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-event-item').first()
      .click();
    cy.get('.mini-popup').contains('Bezár').click();
    cy.get('.mini-popup').should('not.exist');
  });
});

// ── DESCRIBE: Üres állapotok ─────────────────────────────

describe('Homepage — Események üres állapot', () => {
  beforeEach(() => {
    cy.fakeLogin();
    cy.stubApi();
    // Override events to return empty array
    cy.intercept('GET', '**/napicsepp/events**', {
      statusCode: 200,
      body: [],
    }).as('getEventsEmpty');
    cy.visit('/');
    cy.wait('@getEventsEmpty');
  });

  it('20 - Mai események üres szöveg megjelenik', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-events-empty')
      .should('contain.text', 'Nincsenek mai események');
  });

  it('21 - Közelgő események üres szöveg megjelenik', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-events-empty')
      .should('contain.text', 'Nincsenek közelgő események');
  });

  it('22 - Mai események számlálója 0 esemény', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-events-count')
      .should('contain.text', '0 esemény');
  });

  it('23 - Közelgő események számlálója 0 esemény', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-events-count')
      .should('contain.text', '0 esemény');
  });

  it('24 - Nincs upcoming-event-item elem ha üres', () => {
    cy.get('.upcoming-event-item').should('not.exist');
  });
});
