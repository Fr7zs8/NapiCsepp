/* eslint-env mocha, browser */
/* global describe, it, expect */
import CalendarManager from '../../src/classes/Views/calendarManager'

describe('CalendarManager class', () => {

  // ── getMonthView ─────────────────────────────────────────────────

  it('getMonthView: 28-31 nap (hétfőtől vasárnapig paddelve, osztható 7-tel)', () => {
    const cm = new CalendarManager(new Date(2025, 0, 1), 'month', [], [])
    const days = cm.getMonthView(new Date(2025, 0, 1), [], [])
    expect(days.length % 7).to.eq(0)
    // január 2025: 31 nap, jan 1 = szerda → padding hétfő-kedd → min 33 → 35
    expect(days.length).to.be.gte(31)
  })

  it('getMonthView: isCurrentMonth flag helyes', () => {
    const cm = new CalendarManager(new Date(2025, 5, 15), 'month', [], [])
    const days = cm.getMonthView(new Date(2025, 5, 15), [], [])
    const currentMonthDays = days.filter(d => d.isCurrentMonth)
    expect(currentMonthDays.length).to.eq(30) // június = 30 nap
  })

  it('getMonthView: taskCount számol feladatokat adott napon', () => {
    const activities = [
      { activity_start_date: '2025-06-10', type_name: 'Munka' },
      { activity_start_date: '2025-06-10', type_name: 'Tanulás' },
      { activity_start_date: '2025-06-10', type_name: 'Szokás' }, // ez nem task
      { activity_start_date: '2025-06-11', type_name: 'Házimunka' }
    ]
    const cm = new CalendarManager(new Date(2025, 5, 1), 'month', activities, [])
    const days = cm.getMonthView(new Date(2025, 5, 1), activities, [])
    const june10 = days.find(d => d.isCurrentMonth && d.date.getDate() === 10)
    expect(june10.taskCount).to.eq(2) // Munka + Tanulás (Szokás kiszűrve)
  })

  it('getMonthView: _filterHabitsByDate szűri a szokásokat dátum-tartomány szerint', () => {
    const habits = [
      { activity_start_date: '2025-06-01', activity_end_date: '2025-06-15' },
      { activity_start_date: '2025-06-20', activity_end_date: '2025-06-25' }
    ]
    const cm = new CalendarManager(new Date(2025, 5, 1), 'month', [], [])
    const days = cm.getMonthView(new Date(2025, 5, 1), [], habits)
    const june10 = days.find(d => d.isCurrentMonth && d.date.getDate() === 10)
    expect(june10.habits.length).to.eq(1)
    const june22 = days.find(d => d.isCurrentMonth && d.date.getDate() === 22)
    expect(june22.habits.length).to.eq(1)
    const june18 = days.find(d => d.isCurrentMonth && d.date.getDate() === 18)
    expect(june18.habits.length).to.eq(0)
  })

  // ── getWeekView ──────────────────────────────────────────────────

  it('getWeekView: 7 napot ad vissza', () => {
    const cm = new CalendarManager(new Date(2025, 5, 11), 'week', [], [])
    const days = cm.getWeekView(new Date(2025, 5, 11))
    expect(days.length).to.eq(7)
  })

  it('getWeekView: hétfővel kezdődik', () => {
    const cm = new CalendarManager(new Date(2025, 5, 11), 'week', [], [])
    const days = cm.getWeekView(new Date(2025, 5, 11))
    expect(days[0].date.getDay()).to.eq(1) // 1 = hétfő
  })

  // ── getCombinedView ──────────────────────────────────────────────

  it('getCombinedView: összegyűjti a heti aktivitásokat és eseményeket', () => {
    const activities = [
      { activity_start_date: '2025-06-09T10:00:00', type_name: 'Munka' },
      { activity_start_date: '2025-06-10T10:00:00', type_name: 'Tanulás' }
    ]
    const events = [
      { event_id: 1, event_name: 'E1', event_start_time: '2025-06-09 15:00', event_end_time: '2025-06-09 16:00' }
    ]
    const cm = new CalendarManager(new Date(2025, 5, 9), 'combined', activities, events)
    const combined = cm.getCombinedView(new Date(2025, 5, 9))
    expect(combined.weekStart).to.exist
    expect(combined.weekEnd).to.exist
  })

  // ── getDayView ───────────────────────────────────────────────────

  it('getDayView: egy napra szűr', () => {
    const events = [
      { event_id: 1, event_name: 'Ma', event_start_time: '2025-06-15 10:00', event_end_time: '2025-06-15 11:00' },
      { event_id: 2, event_name: 'Holnap', event_start_time: '2025-06-16 10:00', event_end_time: '2025-06-16 11:00' }
    ]
    const cm = new CalendarManager(new Date(2025, 5, 15), 'day', [], events)
    const day = cm.getDayView(new Date(2025, 5, 15))
    expect(day.events.length).to.eq(1)
    expect(day.events[0].eventName).to.eq('Ma')
  })

  // ── getStartOfWeek ──────────────────────────────────────────────

  it('getStartOfWeek: vasárnapra is hétfőt ad', () => {
    const cm = new CalendarManager(new Date(), 'week', [], [])
    // 2025-06-15 = vasárnap
    const start = cm.getStartOfWeek(new Date(2025, 5, 15))
    expect(start.getDay()).to.eq(1) // hétfő
    expect(start.getDate()).to.eq(9) // jun 9 (hétfő)
  })

  it('getStartOfWeek: szerdára is hétfőt ad', () => {
    const cm = new CalendarManager(new Date(), 'week', [], [])
    // 2025-06-11 = szerda
    const start = cm.getStartOfWeek(new Date(2025, 5, 11))
    expect(start.getDay()).to.eq(1)
    expect(start.getDate()).to.eq(9)
  })
})
