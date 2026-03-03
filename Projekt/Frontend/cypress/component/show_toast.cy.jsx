/* eslint-env mocha, browser */
/* global describe, it, expect */
import { showToast, DEFAULT_TOAST_DURATION, ERROR_TOAST_DURATION } from '../../src/components/Toast/showToast'

describe('showToast utility', () => {

  it('DEFAULT_TOAST_DURATION = 3000ms', () => {
    expect(DEFAULT_TOAST_DURATION).to.eq(3000)
  })

  it('ERROR_TOAST_DURATION = 6000ms (dupla)', () => {
    expect(ERROR_TOAST_DURATION).to.eq(6000)
  })

  it('CustomEvent-et dob showToast eseményre alapértelmezett duration-nel', (done) => {
    const handler = (e) => {
      expect(e.detail.message).to.eq('Teszt üzenet')
      expect(e.detail.type).to.eq('success')
      expect(e.detail.duration).to.eq(3000)
      window.removeEventListener('showToast', handler)
      done()
    }
    window.addEventListener('showToast', handler)
    showToast('Teszt üzenet', 'success')
  })

  it('error típusnál dupla duration', (done) => {
    const handler = (e) => {
      expect(e.detail.type).to.eq('error')
      expect(e.detail.duration).to.eq(6000)
      window.removeEventListener('showToast', handler)
      done()
    }
    window.addEventListener('showToast', handler)
    showToast('Hiba!', 'error')
  })

  it('egyedi duration-t használ ha megadják', (done) => {
    const handler = (e) => {
      expect(e.detail.duration).to.eq(1000)
      window.removeEventListener('showToast', handler)
      done()
    }
    window.addEventListener('showToast', handler)
    showToast('Gyors', 'success', 1000)
  })
})
