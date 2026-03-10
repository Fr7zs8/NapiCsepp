/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════
// Daily View — Eseményblokkok & Közelgő események panel e2e
// ═══════════════════════════════════════════════════════════

const today = new Date();
const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);
const dayAfterStr = dayAfter.toISOString().split('T')[0];

const todayEvent = {
  event_id: 300,
  event_name: 'Mai daily esemény',
  event_start_time: `${todayStr}T09:00:00`,
  event_end_time: `${todayStr}T10:30:00`,
};

const futureEvents = [
  {
    event_id: 301,
    event_name: 'Holnapi standup',
    event_start_time: `${tomorrowStr}T10:00:00`,
    event_end_time: `${tomorrowStr}T10:30:00`,
  },
  {
    event_id: 302,
    event_name: 'Holnapután retrospektív',
    event_start_time: `${dayAfterStr}T15:00:00`,
    event_end_time: `${dayAfterStr}T16:00:00`,
  },
];

const allEvents = [todayEvent, ...futureEvents];

// ── Esemény blokkok a napi idővonalban ───────────────────

describe('Daily View — Esemény blokk megjelenés', () => {
  beforeEach(() => {
    cy.fakeLogin();
    cy.stubApi();
    cy.intercept('GET', '**/napicsepp/events**', {
      statusCode: 200,
      body: allEvents,
    }).as('getEventsDaily');
    cy.visit('/calendar/daily');
    cy.wait('@getEventsDaily');
  });

  it('1 - Napi nézet betöltődik', () => {
    cy.get('.day-calendar-section').should('be.visible');
  });

  it('2 - Esemény blokk megjelenik az idővonalban', () => {
    cy.get('.event-block-daily').should('have.length.gte', 1);
  });

  it('3 - Esemény blokk tartalmazza az esemény nevét', () => {
    cy.get('.event-block-daily .event-name').first().should('contain.text', todayEvent.event_name);
  });

  it('4 - Esemény blokk tartalmazza az időtartamot', () => {
    cy.get('.event-block-daily .event-time').first().should('not.be.empty');
    // 09:00 - 10:30 format expected
    cy.get('.event-block-daily .event-time').first().should('contain.text', '09:00');
  });

  it('5 - Esemény blokk helyes pozícióban van (top px)', () => {
    cy.get('.event-block-daily').first().should('have.attr', 'style').and('contain', 'top');
  });

  it('6 - Esemény blokkra kattintás megnyitja a mini popupot', () => {
    cy.get('.event-block-daily').first().click();
    cy.get('.mini-popup').should('be.visible');
  });

  it('7 - Mini popup Szerkesztés megnyitja az EventPopupot', () => {
    cy.get('.event-block-daily').first().click();
    cy.get('.mini-popup').contains('Szerkesztés').click();
    cy.get('.popup-form').should('be.visible');
  });

  it('8 - Mini popup Törlés DELETE kérést küld', () => {
    cy.intercept('DELETE', '**/napicsepp/event/**', { statusCode: 200, body: { success: true } }).as('deleteEventSingular');
    cy.get('.event-block-daily').first().click();
    cy.get('.mini-popup').contains('Törlés').click();
    cy.wait('@deleteEventSingular');
  });

  it('9 - Mini popup Bezár gomb bezárja a popupot', () => {
    cy.get('.event-block-daily').first().click();
    cy.get('.mini-popup').should('be.visible');
    cy.get('.mini-popup').contains('Bezár').click();
    cy.get('.mini-popup').should('not.exist');
  });

  it('10 - Üres idősáv kattintás EventPopupot nyit', () => {
    // Wait for event block to confirm calendarManager is initialised
    cy.get('.event-block-daily').should('exist');
    // The clickable overlay divs have "cursor: pointer" and height 60px.
    // The event occupies hour 9-10, so hour 20 is guaranteed empty.
    // Select all overlays (cursor:pointer + transparent bg, no class) inside .day-timeline.
    cy.get('.day-timeline > div[style*="cursor: pointer"][style*="height: 60px"]')
      .eq(20)
      .scrollIntoView()
      .click({ force: true });
    cy.get('.popup-form', { timeout: 10000 }).should('be.visible');
  });

  it('11 - EventPopup Mégse bezárja a szerkesztőt', () => {
    cy.get('.event-block-daily').should('exist');
    cy.get('.day-timeline > div[style*="cursor: pointer"][style*="height: 60px"]')
      .eq(20)
      .scrollIntoView()
      .click({ force: true });
    cy.get('.popup-form', { timeout: 10000 }).should('be.visible');
    cy.get('.popup-form .btn-cancel').click();
    cy.get('.popup-form').should('not.exist');
  });
});

// ── Közelgő események panel (daily-future-panel) ─────────

describe('Daily View — Közelgő események panel', () => {
  beforeEach(() => {
    cy.fakeLogin();
    cy.stubApi();
    cy.intercept('GET', '**/napicsepp/events**', {
      statusCode: 200,
      body: allEvents,
    }).as('getEventsDaily');
    cy.visit('/calendar/daily');
    cy.wait('@getEventsDaily');
  });

  it('12 - Közelgő események panel megjelenik', () => {
    cy.get('.daily-future-panel').should('be.visible');
  });

  it('13 - Panel fejléc tartalmazza a "Közelgő események" szöveget', () => {
    cy.get('.daily-future-panel-header h4').should('contain.text', 'Közelgő események');
  });

  it('14 - Panel fejlécben megjelenik az óra ikon', () => {
    cy.get('.daily-future-icon').should('exist');
  });

  it('15 - Közelgő események listában megjelennek a jövőbeli események', () => {
    cy.get('.daily-future-list .daily-future-item').should('have.length.gte', 1);
  });

  it('16 - Közelgő esemény neve megjelenik', () => {
    cy.get('.daily-future-name').first().should('not.be.empty');
  });

  it('17 - Közelgő esemény időpontja megjelenik', () => {
    cy.get('.daily-future-time').first().should('not.be.empty');
  });

  it('18 - Közelgő esemény pont (dot) megjelenik', () => {
    cy.get('.daily-future-dot').should('have.length.gte', 1);
  });

  it('19 - Közelgő eseményre kattintás megnyitja a mini popupot', () => {
    cy.get('.daily-future-item').first().click();
    cy.get('.mini-popup').should('be.visible');
  });

  it('20 - Mini popup Szerkesztés megnyitja az EventPopupot', () => {
    cy.get('.daily-future-item').first().click();
    cy.get('.mini-popup').contains('Szerkesztés').click();
    cy.get('.popup-form').should('be.visible');
  });

  it('21 - Mini popup Törlés DELETE kérést küld', () => {
    cy.intercept('DELETE', '**/napicsepp/event/**', { statusCode: 200, body: { success: true } }).as('deleteEventSingular');
    cy.get('.daily-future-item').first().click();
    cy.get('.mini-popup').contains('Törlés').click();
    cy.wait('@deleteEventSingular');
  });

  it('22 - Mini popup Bezár bezárja a popupot', () => {
    cy.get('.daily-future-item').first().click();
    cy.get('.mini-popup').should('be.visible');
    cy.get('.mini-popup').contains('Bezár').click();
    cy.get('.mini-popup').should('not.exist');
  });
});

// ── Üres állapot ─────────────────────────────────────────

describe('Daily View — Üres közelgő események', () => {
  beforeEach(() => {
    cy.fakeLogin();
    cy.stubApi();
    // Use only a past event for today so it won't appear as "közelgő" (future)
    const pastEvent = {
      event_id: 399,
      event_name: 'Régi mai esemény',
      event_start_time: `${todayStr}T00:01:00`,
      event_end_time: `${todayStr}T00:30:00`,
    };
    cy.intercept('GET', '**/napicsepp/events**', {
      statusCode: 200,
      body: [pastEvent],
    }).as('getEventsOnlyToday');
    cy.visit('/calendar/daily');
    cy.wait('@getEventsOnlyToday');
  });

  it('23 - Üres szöveg megjelenik ha nincs közelgő esemény', () => {
    cy.get('.daily-future-empty').should('contain.text', 'Nincsenek közelgő események');
  });

  it('24 - Nincs daily-future-item elem ha üres', () => {
    cy.get('.daily-future-item').should('not.exist');
  });
});

describe('Daily View — Teljesen üres nap', () => {
  beforeEach(() => {
    cy.fakeLogin();
    cy.stubApi();
    cy.intercept('GET', '**/napicsepp/events**', {
      statusCode: 200,
      body: [],
    }).as('getEventsNone');
    cy.visit('/calendar/daily');
    cy.wait('@getEventsNone');
  });

  it('25 - Nincs event-block-daily ha nincs esemény', () => {
    cy.get('.event-block-daily').should('not.exist');
  });

  it('26 - Közelgő események üres szöveg megjelenik', () => {
    cy.get('.daily-future-empty').should('contain.text', 'Nincsenek közelgő események');
  });

  it('27 - Day timeline továbbra is megjelenik', () => {
    cy.get('.day-timeline').should('be.visible');
  });
});
