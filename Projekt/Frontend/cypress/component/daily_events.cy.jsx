/* eslint-env mocha, browser */
/* global cy, describe, it, beforeEach */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { DailyView } from '../../src/pages/calendarPage/dayView/daily'
import * as api from '../../src/router/apiRouter'

// ═══════════════════════════════════════════════════════════
// Daily View — Eseményblokk & Közelgő események component
// ═══════════════════════════════════════════════════════════

const today = new Date()
const todayStr = today.toISOString().split('T')[0]

const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowStr = tomorrow.toISOString().split('T')[0]

const todayEvent = {
  event_id: 700,
  event_name: 'Daily standup',
  event_start_time: `${todayStr}T09:00:00`,
  event_end_time: `${todayStr}T09:30:00`,
}

const futureEvents = [
  {
    event_id: 701,
    event_name: 'Holnapi sprint review',
    event_start_time: `${tomorrowStr}T14:00:00`,
    event_end_time: `${tomorrowStr}T15:00:00`,
  },
]

const allEvents = [todayEvent, ...futureEvents]

function mountDaily(events = allEvents) {
  cy.stub(api.eventService, 'getOverview').resolves(events)
  cy.stub(api.eventService, 'deleteEvent').resolves({ success: true })
  cy.stub(api.eventService, 'updateEvent').resolves({ success: true })
  cy.stub(api.eventService, 'createEvent').resolves({ success: true })

  cy.mount(
    <MemoryRouter initialEntries={['/calendar/daily']}>
      <DailyView />
    </MemoryRouter>
  )
}

// ── Esemény blokkok az idővonalban ───────────────────────

describe('Daily Component — Esemény blokkok', () => {
  beforeEach(() => {
    mountDaily()
  })

  it('1 - Day calendar section megjelenik', () => {
    cy.get('.day-calendar-section').should('exist')
  })

  it('2 - Esemény blokk megjelenik', () => {
    cy.get('.event-block-daily').should('have.length.gte', 1)
  })

  it('3 - Esemény blokk tartalmazza a nevet', () => {
    cy.get('.event-block-daily .event-name').first()
      .should('contain.text', todayEvent.event_name)
  })

  it('4 - Esemény blokk tartalmazza az időt', () => {
    cy.get('.event-block-daily .event-time').first()
      .should('contain.text', '09:00')
  })

  it('5 - Esemény blokk pozíció top stílust tartalmaz', () => {
    cy.get('.event-block-daily').first()
      .should('have.attr', 'style')
      .and('contain', 'top')
  })

  it('6 - Esemény blokkra kattintás mini popupot nyit', () => {
    cy.get('.event-block-daily').first().click()
    cy.get('.mini-popup').should('exist')
  })

  it('7 - Mini popup Bezár gomb működik', () => {
    cy.get('.event-block-daily').first().click()
    cy.get('.mini-popup').contains('Bezár').click()
    cy.get('.mini-popup').should('not.exist')
  })
})

// ── Közelgő események panel ──────────────────────────────

describe('Daily Component — Közelgő események panel', () => {
  beforeEach(() => {
    mountDaily()
  })

  it('8 - Panel megjelenik', () => {
    cy.get('.daily-future-panel').should('exist')
  })

  it('9 - Panel fejléc "Közelgő események"', () => {
    cy.get('.daily-future-panel-header h4').should('contain.text', 'Közelgő események')
  })

  it('10 - Közelgő esemény neve megjelenik', () => {
    cy.get('.daily-future-name').first().should('not.be.empty')
  })

  it('11 - Közelgő esemény időpontja megjelenik', () => {
    cy.get('.daily-future-time').first().should('not.be.empty')
  })

  it('12 - Közelgő esemény pont megjelenik', () => {
    cy.get('.daily-future-dot').should('have.length.gte', 1)
  })

  it('13 - Kattintás mini popupot nyit', () => {
    cy.get('.daily-future-item').first().click()
    cy.get('.mini-popup').should('exist')
  })

  it('14 - Mini popup Bezár bezárja', () => {
    cy.get('.daily-future-item').first().click()
    cy.get('.mini-popup').contains('Bezár').click()
    cy.get('.mini-popup').should('not.exist')
  })
})

// ── Üres állapot ─────────────────────────────────────────

describe('Daily Component — Üres állapot', () => {
  beforeEach(() => {
    mountDaily([])
  })

  it('15 - Nincs event-block-daily ha nincs esemény', () => {
    cy.get('.event-block-daily').should('not.exist')
  })

  it('16 - Közelgő események üres szöveg megjelenik', () => {
    cy.get('.daily-future-empty')
      .should('contain.text', 'Nincsenek közelgő események')
  })

  it('17 - Day timeline továbbra is megjelenik', () => {
    cy.get('.day-timeline').should('exist')
  })

  it('18 - Nincs daily-future-item ha üres', () => {
    cy.get('.daily-future-item').should('not.exist')
  })
})
