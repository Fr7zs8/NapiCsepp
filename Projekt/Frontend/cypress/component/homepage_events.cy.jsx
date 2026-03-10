/* eslint-env mocha, browser */
/* global cy, describe, it, beforeEach */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { HomepageView } from '../../src/pages/homePage/homepage'
import * as api from '../../src/router/apiRouter'

// ═══════════════════════════════════════════════════════════
// Homepage — Mai & Közelgő események component tesztek
// ═══════════════════════════════════════════════════════════

const today = new Date()
const todayStr = today.toISOString().split('T')[0]

const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowStr = tomorrow.toISOString().split('T')[0]

const todayEvents = [
  {
    event_id: 500,
    event_name: 'Reggeli standup',
    event_start_time: `${todayStr}T08:00:00`,
    event_end_time: `${todayStr}T08:30:00`,
  },
  {
    event_id: 501,
    event_name: 'Code review',
    event_start_time: `${todayStr}T14:00:00`,
    event_end_time: `${todayStr}T15:00:00`,
  },
]

const futureEvents = [
  {
    event_id: 600,
    event_name: 'Sprint planning',
    event_start_time: `${tomorrowStr}T09:00:00`,
    event_end_time: `${tomorrowStr}T10:00:00`,
  },
]

const allEvents = [...todayEvents, ...futureEvents]

function mountHomepage(events = allEvents) {
  cy.stub(api.clientService, 'getProfile').resolves({ username: 'TesztUser', register_date: '2025-01-01' })
  cy.stub(api.clientService, 'getStatistics').resolves({
    total_activity: 5,
    completed: 3,
    daily_tasks_count: 2,
    monthly_events_count: 3,
    hard_tasks: 1,
    middle_tasks: 2,
    easy_tasks: 2,
    weekly_tasks: 4,
    weekly_tasks_completed: 2,
  })
  cy.stub(api.activityService, 'getAllHabits').resolves([])
  cy.stub(api.eventService, 'getOverview').resolves(events)
  cy.stub(api.eventService, 'deleteEvent').resolves({ success: true })
  cy.stub(api.eventService, 'updateEvent').resolves({ success: true })

  cy.mount(
    <MemoryRouter>
      <HomepageView />
    </MemoryRouter>
  )
}

// ── Mai események szekció ────────────────────────────────

describe('Homepage Component — Mai események', () => {
  beforeEach(() => {
    mountHomepage()
  })

  it('1 - Mai események szekció megjelenik', () => {
    cy.get('.upcoming-events-section').first().should('contain.text', 'Mai események')
  })

  it('2 - Mai események számláló helyes', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-events-count')
      .should('contain.text', `${todayEvents.length} esemény`)
  })

  it('3 - Mai események nevei megjelennek', () => {
    cy.get('.upcoming-events-section').first().within(() => {
      cy.contains('Reggeli standup').should('exist')
      cy.contains('Code review').should('exist')
    })
  })

  it('4 - Mai események időpontja megjelenik', () => {
    cy.get('.upcoming-events-section').first().within(() => {
      cy.get('.upcoming-event-time').should('have.length', todayEvents.length)
    })
  })

  it('5 - Mai események pont és nyíl ikon megjelenik', () => {
    cy.get('.upcoming-events-section').first().within(() => {
      cy.get('.upcoming-event-dot').should('have.length', todayEvents.length)
      cy.get('.upcoming-event-arrow').should('have.length', todayEvents.length)
    })
  })

  it('6 - Mai eseményre kattintás mini popupot nyit', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click()
    cy.get('.mini-popup').should('exist')
  })

  it('7 - Mini popup Bezár gomb bezárja', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-event-item').first()
      .click()
    cy.get('.mini-popup').contains('Bezár').click()
    cy.get('.mini-popup').should('not.exist')
  })
})

// ── Közelgő események szekció ────────────────────────────

describe('Homepage Component — Közelgő események', () => {
  beforeEach(() => {
    mountHomepage()
  })

  it('8 - Közelgő események szekció megjelenik', () => {
    cy.get('.upcoming-events-section').eq(1).should('contain.text', 'Közelgő események')
  })

  it('9 - Közelgő események számláló megjelenik', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-events-count')
      .invoke('text')
      .should('match', /\d+ esemény/)
  })

  it('10 - Közelgő esemény neve megjelenik', () => {
    cy.get('.upcoming-events-section').eq(1).within(() => {
      cy.contains('Sprint planning').should('exist')
    })
  })

  it('11 - Közelgő események időpontja megjelenik', () => {
    cy.get('.upcoming-events-section').eq(1).within(() => {
      cy.get('.upcoming-event-time').should('have.length.gte', 1)
    })
  })

  it('12 - Közelgő eseményre kattintás mini popupot nyit', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-event-item').first()
      .click()
    cy.get('.mini-popup').should('exist')
  })
})

// ── Üres állapot ─────────────────────────────────────────

describe('Homepage Component — Üres események', () => {
  beforeEach(() => {
    mountHomepage([])
  })

  it('13 - Mai események üres szöveg', () => {
    cy.get('.upcoming-events-section').first()
      .should('contain.text', 'Nincsenek mai események')
  })

  it('14 - Közelgő események üres szöveg', () => {
    cy.get('.upcoming-events-section').eq(1)
      .should('contain.text', 'Nincsenek közelgő események')
  })

  it('15 - Nincs event item ha üres', () => {
    cy.get('.upcoming-event-item').should('not.exist')
  })

  it('16 - Mai események számláló 0', () => {
    cy.get('.upcoming-events-section').first()
      .find('.upcoming-events-count')
      .should('contain.text', '0 esemény')
  })

  it('17 - Közelgő események számláló 0', () => {
    cy.get('.upcoming-events-section').eq(1)
      .find('.upcoming-events-count')
      .should('contain.text', '0 esemény')
  })
})
