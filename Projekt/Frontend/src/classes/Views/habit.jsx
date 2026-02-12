export default class Habit {
  constructor(
    habitId,
    habitName,
    typeName,
    difficultyName,
    targetDays,
    startDate,
    endDate = null,
    checkedDays = null,
  ) {
    this.habitId = habitId;
    this.habitName = habitName;
    this.typeName = typeName;
    this.difficultyName = difficultyName;
    // ensure numeric
    this.targetDays = targetDays ? Number(targetDays) : 0;
    // normalize startDate to YYYY-MM-DD when possible
    try {
      const d = new Date(startDate);
      if (!Number.isNaN(d.getTime())) {
        this.startDate = d.toISOString().split("T")[0];
      } else {
        this.startDate = startDate;
      }
    } catch (e) {
      this.startDate = startDate;
    }
    // optional: number of checked days (used for progress calculation)
    this.checkedDays = checkedDays;
    // store endDate and compute totalDays between start and end
    try {
      const ed = new Date(endDate);
      const sd = new Date(this.startDate);
      if (!Number.isNaN(ed.getTime()) && !Number.isNaN(sd.getTime())) {
        // normalize endDate
        this.endDate = ed.toISOString().split("T")[0];
        const diffTime = ed.setHours(0,0,0,0) - sd.setHours(0,0,0,0);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        // include both start and end -> +1
        this.totalDays = Math.max(0, diffDays + 1);
      } else {
        this.endDate = endDate;
        this.totalDays = this.targetDays || 0;
      }
    } catch (e) {
      this.endDate = endDate;
      this.totalDays = this.targetDays || 0;
    }
  }

  getDaysElapsed() {
    // if checkedDays provided, use it (progress based on checked tasks)
    if (this.checkedDays !== null && !Number.isNaN(Number(this.checkedDays))) {
      return Math.max(0, Number(this.checkedDays));
    }

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
    const remaining = (this.totalDays || this.targetDays) - elapsed;

    return Math.max(0, remaining);
  }

  getProgress() {
    const elapsed = this.getDaysElapsed();
    const total = this.totalDays || this.targetDays || 0;
    if (!total || total === 0) return 0;
    const progress = (elapsed / total) * 100;

    return Math.min(100, Math.round(progress));
  }

  isCompleted() {
    const total = this.totalDays || this.targetDays || 0;
    return total > 0 && this.getDaysElapsed() >= total;
  }

  getCheckedDays() {
    if (this.checkedDays !== null && !Number.isNaN(Number(this.checkedDays))) return Number(this.checkedDays);
    return 0;
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
