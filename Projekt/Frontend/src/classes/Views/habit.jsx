export default class Habit {
  constructor(
    habitId,
    habitName,
    typeName,
    difficultyName,
    targetDays,
    startDate,
  ) {
    ((this.habitId = habitId),
      (this.habitName = habitName),
      (this.typeName = typeName),
      (this.difficultyName = difficultyName),
      (this.targetDays = targetDays),
      (this.startDate = startDate));
  }

  getDaysElapsed() {
    const start = new Date(this.startDate);
    const today = new Date();

    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
  getDaysRemaining() {
    const elapsed = this.getDaysElapsed();
    const remaining = this.targetDays - elapsed;

    return Math.max(0, remaining);
  }

  getProgress() {
    const elapsed = this.getDaysElapsed();
    const progress = (elapsed / this.targetDays) * 100;

    return Math.min(100, Math.round(progress));
  }

  isCompleted() {
    return this.getDaysElapsed() >= this.targetDays;
  }

  toJSON() {
    return {
      habitId: this.habitId,
      habitName: this.habitName,
      typeName: this.typeName,
      difficultyName: this.difficultyName,
      targetDays: this.targetDays,
      startDate: this.startDate,
    };
  }
}
