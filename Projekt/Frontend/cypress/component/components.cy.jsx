/* eslint-env mocha, browser */
/* global cy, describe, it */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

// ═══════════════════════════════════════════════════════════════════
// PasswordInput – jelszó mutatás/elrejtés toggle
// ═══════════════════════════════════════════════════════════════════
import PasswordInput from '../../src/components/PasswordInput/PasswordInput'

describe('PasswordInput komponens', () => {
  it('alapból password típusú input', () => {
    cy.mount(<PasswordInput value="" onChange={() => {}} placeholder="Jelszó" />)
    cy.get('input').should('have.attr', 'type', 'password')
  })

  it('kattintásra text típusra vált (megmutatja a jelszót)', () => {
    cy.mount(<PasswordInput value="titkos" onChange={() => {}} placeholder="Jelszó" />)
    cy.get('.password-toggle-btn').click()
    cy.get('input').should('have.attr', 'type', 'text')
  })

  it('dupla kattintásra visszaáll password típusra', () => {
    cy.mount(<PasswordInput value="titkos" onChange={() => {}} placeholder="Jelszó" />)
    cy.get('.password-toggle-btn').click()
    cy.get('.password-toggle-btn').click()
    cy.get('input').should('have.attr', 'type', 'password')
  })

  it('required attribútum átadódik', () => {
    cy.mount(<PasswordInput value="" onChange={() => {}} placeholder="PW" required />)
    cy.get('input').should('have.attr', 'required')
  })
})

// ═══════════════════════════════════════════════════════════════════
// DataItem – label + value megjelenítés ikonnal
// ═══════════════════════════════════════════════════════════════════
import DataItem from '../../src/components/Profile/DataItem'
import { Mail } from 'lucide-react'

describe('DataItem komponens', () => {
  it('megjeleníti a label-t és a value-t', () => {
    cy.mount(<DataItem icon={Mail} label="Email cím" value="a@b.hu" />)
    cy.contains('Email cím').should('exist')
    cy.contains('a@b.hu').should('exist')
  })

  it('ikon nélkül is működik', () => {
    cy.mount(<DataItem label="Teszt" value="Valami" />)
    cy.contains('Teszt').should('exist')
    cy.contains('Valami').should('exist')
  })
})

// ═══════════════════════════════════════════════════════════════════
// StatItem – statisztika érték megjelenítés
// ═══════════════════════════════════════════════════════════════════
import StatItem from '../../src/components/Profile/StatItem'

describe('StatItem komponens', () => {
  it('megjeleníti a value-t és a label-t', () => {
    cy.mount(
      <StatItem label="Feladatok" value={42} className="stat-tasks">
        <p>Ikon</p>
      </StatItem>
    )
    cy.get('.stat-value').should('contain.text', '42')
    cy.get('.stat-label').should('contain.text', 'Feladatok')
  })

  it('className prop átadódik', () => {
    cy.mount(
      <StatItem label="X" value={0} className="custom-class">
        <p>C</p>
      </StatItem>
    )
    cy.get('.stat-item').should('have.class', 'custom-class')
  })
})

// ═══════════════════════════════════════════════════════════════════
// ProfileCard – @ + lowercase username
// ═══════════════════════════════════════════════════════════════════
import ProfileCard from '../../src/components/Profile/ProfileCard'

describe('ProfileCard komponens', () => {
  it('username-et @kisbetűs formátumban jeleníti meg', () => {
    cy.mount(<ProfileCard username="TesztUser" email="a@b.hu" />)
    cy.get('.username').should('contain.text', '@tesztuser')
  })

  it('email-t jeleníti meg', () => {
    cy.mount(<ProfileCard username="X" email="pelda@email.hu" />)
    cy.contains('pelda@email.hu').should('exist')
  })

  it('üres username-re is működik (nem dob hibát)', () => {
    cy.mount(<ProfileCard username="" email="" />)
    cy.get('.username').should('contain.text', '@')
  })
})

// ═══════════════════════════════════════════════════════════════════
// LoginRegisterSwitch – helyes rádiógomb kiválasztás
// ═══════════════════════════════════════════════════════════════════
import { LoginRegisterSwitch } from '../../src/components/login-register-switch/login-register-switch'

describe('LoginRegisterSwitch komponens', () => {
  it('login oldalnál a login rádiógomb checked', () => {
    cy.mount(
      <MemoryRouter>
        <LoginRegisterSwitch currentPage="login" />
      </MemoryRouter>
    )
    cy.get('#lr-switch1').should('be.checked')
    cy.get('#lr-switch2').should('not.be.checked')
  })

  it('register oldalnál a register rádiógomb checked', () => {
    cy.mount(
      <MemoryRouter>
        <LoginRegisterSwitch currentPage="register" />
      </MemoryRouter>
    )
    cy.get('#lr-switch1').should('not.be.checked')
    cy.get('#lr-switch2').should('be.checked')
  })
})
