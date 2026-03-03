/* eslint-env mocha, browser */
/* global describe, it, expect */
import { calculateEventLayout } from '../../src/utils/eventLayout'

describe('calculateEventLayout utility', () => {

  it('üres tömböt ad vissza ha nincs esemény', () => {
    expect(calculateEventLayout([])).to.deep.eq([])
    expect(calculateEventLayout(null)).to.deep.eq([])
    expect(calculateEventLayout(undefined)).to.deep.eq([])
  })

  it('egy eseménynél startMinutes és duration helyes', () => {
    const events = [
      { event_start_time: '2025-06-15 10:30', event_end_time: '2025-06-15 12:00' }
    ]
    const result = calculateEventLayout(events)
    expect(result.length).to.eq(1)
    expect(result[0].startMinutes).to.eq(10 * 60 + 30) // 630
    expect(result[0].duration).to.eq(90) // 1.5 óra
  })

  it('két nem-átfedő esemény: mindkettő column=0, totalColumns=1', () => {
    const events = [
      { event_start_time: '2025-06-15 10:00', event_end_time: '2025-06-15 11:00' },
      { event_start_time: '2025-06-15 14:00', event_end_time: '2025-06-15 15:00' }
    ]
    const result = calculateEventLayout(events)
    expect(result.length).to.eq(2)
    // nem átfedők → totalColumns=1
    result.forEach(r => {
      expect(r.totalColumns).to.eq(1)
    })
  })

  it('két átfedő esemény: totalColumns > 1', () => {
    const events = [
      { event_start_time: '2025-06-15 10:00', event_end_time: '2025-06-15 12:00' },
      { event_start_time: '2025-06-15 11:00', event_end_time: '2025-06-15 13:00' }
    ]
    const result = calculateEventLayout(events)
    expect(result.length).to.eq(2)
    expect(result[0].totalColumns).to.eq(2)
    expect(result[1].totalColumns).to.eq(2)
  })

  it('időrendbe rendez startTime szerint', () => {
    const events = [
      { event_start_time: '2025-06-15 14:00', event_end_time: '2025-06-15 15:00' },
      { event_start_time: '2025-06-15 09:00', event_end_time: '2025-06-15 10:00' }
    ]
    const result = calculateEventLayout(events)
    expect(result[0].startMinutes).to.be.lt(result[1].startMinutes)
  })
})
