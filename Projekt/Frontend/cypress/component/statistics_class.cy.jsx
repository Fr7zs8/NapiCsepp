/* eslint-env mocha, browser */
/* global describe, it, expect */
import Statistics from '../../src/classes/Views/statistics'

describe('Statistics class – minden számítás', () => {

  // ── constructor ──────────────────────────────────────────────────

  it('alapértékek 0-k ha üres objektummal hívjuk', () => {
    const s = new Statistics({})
    expect(s.totalActivities).to.eq(0)
    expect(s.completedActivities).to.eq(0)
    expect(s.dailyTasksCount).to.eq(0)
    expect(s.monthlyEventsCount).to.eq(0)
    expect(s.hardTasks).to.eq(0)
    expect(s.middleTasks).to.eq(0)
    expect(s.easyTasks).to.eq(0)
    expect(s.weeklyTasks).to.eq(0)
    expect(s.weeklyCompleted).to.eq(0)
  })

  it('helyesen olvassa be a szerver-oldali mezőneveket', () => {
    const s = new Statistics({
      total_activity: 10,
      completed: 7,
      daily_tasks_count: 3,
      monthly_events_count: 5,
      hard_tasks: 2,
      middle_tasks: 4,
      easy_tasks: 4,
      weekly_tasks: 8,
      weekly_tasks_completed: 6
    })
    expect(s.totalActivities).to.eq(10)
    expect(s.completedActivities).to.eq(7)
    expect(s.dailyTasksCount).to.eq(3)
    expect(s.monthlyEventsCount).to.eq(5)
    expect(s.hardTasks).to.eq(2)
    expect(s.middleTasks).to.eq(4)
    expect(s.easyTasks).to.eq(4)
    expect(s.weeklyTasks).to.eq(8)
    expect(s.weeklyCompleted).to.eq(6)
  })

  // ── getDailyCompletionRate ───────────────────────────────────────

  it('getDailyCompletionRate: 0 ha nincs aktivitás', () => {
    const s = new Statistics({})
    expect(s.getDailyCompletionRate()).to.eq(0)
  })

  it('getDailyCompletionRate: 50% ha 5/10 kész', () => {
    const s = new Statistics({ total_activity: 10, completed: 5 })
    expect(s.getDailyCompletionRate()).to.eq(50)
  })

  it('getDailyCompletionRate: 100% ha mind kész', () => {
    const s = new Statistics({ total_activity: 3, completed: 3 })
    expect(s.getDailyCompletionRate()).to.eq(100)
  })

  it('getDailyCompletionRate: kerekít', () => {
    const s = new Statistics({ total_activity: 3, completed: 1 })
    expect(s.getDailyCompletionRate()).to.eq(33) // Math.round(33.33)
  })

  // ── getWeeklyCompletionRate ──────────────────────────────────────

  it('getWeeklyCompletionRate: 0 ha nincs heti feladat', () => {
    const s = new Statistics({})
    expect(s.getWeeklyCompletionRate()).to.eq(0)
  })

  it('getWeeklyCompletionRate: 75% ha 6/8', () => {
    const s = new Statistics({ weekly_tasks: 8, weekly_tasks_completed: 6 })
    expect(s.getWeeklyCompletionRate()).to.eq(75)
  })

  // ── getDifficultyDistribution ────────────────────────────────────

  it('getDifficultyDistribution: mind 0 ha nincsenek feladatok', () => {
    const s = new Statistics({})
    const d = s.getDifficultyDistribution()
    expect(d.hard).to.eq(0)
    expect(d.middle).to.eq(0)
    expect(d.easy).to.eq(0)
  })

  it('getDifficultyDistribution: százalékos eloszlás', () => {
    const s = new Statistics({ hard_tasks: 1, middle_tasks: 2, easy_tasks: 7 })
    const d = s.getDifficultyDistribution()
    expect(d.hard).to.eq(10)
    expect(d.middle).to.eq(20)
    expect(d.easy).to.eq(70)
  })

  it('getDifficultyDistribution: kerekített értékek', () => {
    const s = new Statistics({ hard_tasks: 1, middle_tasks: 1, easy_tasks: 1 })
    const d = s.getDifficultyDistribution()
    expect(d.hard).to.eq(33)
    expect(d.middle).to.eq(33)
    expect(d.easy).to.eq(33)
  })

  // ── extra mező kezelés ───────────────────────────────────────────

  it('setExtra / getExtra', () => {
    const s = new Statistics({})
    expect(s.getExtra('foo')).to.be.undefined
    s.setExtra('foo', 42)
    expect(s.getExtra('foo')).to.eq(42)
  })

  // ── getActiveHabitsCount (static) ────────────────────────────────

  it('getActiveHabitsCount: 0 ha nem tömb', () => {
    expect(Statistics.getActiveHabitsCount(null)).to.eq(0)
    expect(Statistics.getActiveHabitsCount(undefined)).to.eq(0)
  })

  it('getActiveHabitsCount: kiszűri a befejezetteket (progress >= target)', () => {
    const habits = [
      { target_days: 10, progress_counter: 10 },  // kész → kiszűr
      { target_days: 10, progress_counter: 5 },   // aktív
      { target_days: 0, progress_counter: 0 },     // target=0 → aktív (return true)
      { target_days: 7, progress_counter: null }    // null progress → aktív
    ]
    expect(Statistics.getActiveHabitsCount(habits)).to.eq(3)
  })

  // ── toJSON ───────────────────────────────────────────────────────

  it('toJSON visszaadja az összes mezőt', () => {
    const s = new Statistics({ total_activity: 1, completed: 1 })
    s.setExtra('x', 9)
    const j = s.toJSON()
    expect(j.totalActivities).to.eq(1)
    expect(j.extra.x).to.eq(9)
  })
})
