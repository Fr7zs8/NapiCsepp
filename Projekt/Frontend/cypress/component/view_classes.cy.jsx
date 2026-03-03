/* eslint-env mocha, browser */
/* global describe, it, expect */
import User from '../../src/classes/Views/user'
import Task from '../../src/classes/Views/task'
import Habit from '../../src/classes/Views/habit'
import Event from '../../src/classes/Views/event'

// ═══════════════════════════════════════════════════════════════════
// User
// ═══════════════════════════════════════════════════════════════════
describe('User class', () => {
  it('isAdmin igaz admin role-ra', () => {
    const u = new User(1, 'a@b.hu', 'pw', 'Teszt', 'admin', '2025-01-01')
    expect(u.isAdmin()).to.be.true
  })

  it('isAdmin igaz ADMIN (nagybetűs) role-ra', () => {
    const u = new User(1, 'a@b.hu', 'pw', 'Teszt', 'ADMIN', '2025-01-01')
    expect(u.isAdmin()).to.be.true
  })

  it('isAdmin hamis user role-ra', () => {
    const u = new User(1, 'a@b.hu', 'pw', 'Teszt', 'user', '2025-01-01')
    expect(u.isAdmin()).to.be.false
  })

  it('toJSON nem tartalmazza a jelszót', () => {
    const u = new User(1, 'a@b.hu', 'titkos', 'Teszt', 'user', '2025-01-01')
    const j = u.toJSON()
    expect(j).to.not.have.property('password')
    expect(j.email).to.eq('a@b.hu')
    expect(j.username).to.eq('Teszt')
  })
})

// ═══════════════════════════════════════════════════════════════════
// Task
// ═══════════════════════════════════════════════════════════════════
describe('Task class', () => {
  it('markCompleted beállítja isCompleted-et', () => {
    const t = new Task(1, 'Teszt', 'Munka', 'Könnyű', false, '2025-01-01', '2025-01-01', true)
    expect(t.isCompleted).to.be.false
    t.markCompleted()
    expect(t.isCompleted).to.be.true
  })

  it('toggleActivity megfordítja isActive-ot', () => {
    const t = new Task(1, 'Teszt', 'Munka', 'Könnyű', false, '2025-01-01', '2025-01-01', true)
    expect(t.isActive).to.be.true
    t.toggleActivity()
    expect(t.isActive).to.be.false
    t.toggleActivity()
    expect(t.isActive).to.be.true
  })

  it('getDifficulty visszaadja a nehézséget', () => {
    const t = new Task(1, 'Teszt', 'Tanulás', 'Nehéz', false, '2025-01-01', '2025-01-01', true)
    expect(t.getDifficulty()).to.eq('Nehéz')
  })

  it('toJSON tartalmazza az összes mezőt', () => {
    const t = new Task(1, 'Teszt', 'Tanulás', 'Nehéz', true, '2025-01-01', '2025-01-02', false)
    const j = t.toJSON()
    expect(j.taskId).to.eq(1)
    expect(j.taskName).to.eq('Teszt')
    expect(j.isCompleted).to.be.true
  })
})

// ═══════════════════════════════════════════════════════════════════
// Habit
// ═══════════════════════════════════════════════════════════════════
describe('Habit class', () => {
  it('getProgress: 50% ha a progress_counter fele a totalDays-nek', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 10, '2025-01-01', '2025-01-10', null, 5)
    expect(h.getProgress()).to.eq(50)
  })

  it('getProgress: 100% cap ha meghaladja a totalDays-t', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 10, '2025-01-01', '2025-01-10', null, 20)
    expect(h.getProgress()).to.eq(100)
  })

  it('getProgress: 0 ha nincs totalDays és targetDays sem', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 0, '2025-01-01', null, null, null)
    expect(h.getProgress()).to.eq(0)
  })

  it('getDaysElapsed: progressCounter-t használja ha elérhető', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 10, '2025-01-01', '2025-01-10', null, 7)
    expect(h.getDaysElapsed()).to.eq(7)
  })

  it('getDaysRemaining: totalDays - elapsed', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 10, '2025-01-01', '2025-01-10', null, 3)
    expect(h.getDaysRemaining()).to.eq(7)
  })

  it('getDaysRemaining: nem megy 0 alá', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 5, '2025-01-01', '2025-01-05', null, 99)
    expect(h.getDaysRemaining()).to.eq(0)
  })

  it('isCompleted: igaz ha elapsed >= totalDays', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 5, '2025-01-01', '2025-01-05', null, 5)
    expect(h.isCompleted()).to.be.true
  })

  it('isCompleted: hamis ha még hátra van', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 5, '2025-01-01', '2025-01-05', null, 2)
    expect(h.isCompleted()).to.be.false
  })

  it('getCheckedDays: progressCounter-t adja vissza', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 10, '2025-01-01', '2025-01-10', null, 4)
    expect(h.getCheckedDays()).to.eq(4)
  })

  it('getCheckedDays: checkedDays-t használja ha nincs progressCounter', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 10, '2025-01-01', '2025-01-10', 6, null)
    expect(h.getCheckedDays()).to.eq(6)
  })

  it('totalDays: a startDate és endDate közötti napok (+1)', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 30, '2025-01-01', '2025-01-10', null, null)
    expect(h.totalDays).to.eq(10) // jan 1 - jan 10 = 10 nap
  })

  it('toJSON tartalmazza a szükséges mezőket', () => {
    const h = new Habit(1, 'Víz', 'Szokás', 'Könnyű', 10, '2025-01-01', '2025-01-10', null, 5)
    const j = h.toJSON()
    expect(j.habitId).to.eq(1)
    expect(j.habitName).to.eq('Víz')
    expect(j.progressCounter).to.eq(5)
  })
})

// ═══════════════════════════════════════════════════════════════════
// Event
// ═══════════════════════════════════════════════════════════════════
describe('Event class', () => {
  it('getDuration: 1 óra 30 perc', () => {
    const e = new Event(1, 'Teszt', '2025-06-15 10:00', '2025-06-15 11:30')
    const d = e.getDuration()
    expect(d.hours).to.eq(1)
    expect(d.mins).to.eq(30)
  })

  it('getDuration: null ha nincs startTime', () => {
    const e = new Event(1, 'Teszt', null, null)
    expect(e.getDuration()).to.be.null
  })

  it('formatTime: "10:00 - 11:30"', () => {
    const e = new Event(1, 'Teszt', '2025-06-15 10:00', '2025-06-15 11:30')
    expect(e.formatTime()).to.eq('10:00 - 11:30')
  })

  it('formatTime: üres string ha nincs adat', () => {
    const e = new Event(1, 'Teszt', null, null)
    expect(e.formatTime()).to.eq('')
  })

  it('toJSON tartalmazza az összes mezőt', () => {
    const e = new Event(1, 'Teszt', '2025-06-15 10:00', '2025-06-15 11:30')
    const j = e.toJSON()
    expect(j.eventId).to.eq(1)
    expect(j.eventName).to.eq('Teszt')
  })
})
