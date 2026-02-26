    export default class Statistics {
        static getActiveHabitsCount(habits) {
            if (!Array.isArray(habits)) return 0;

            return habits.filter(h => {
                const targetDays = h.target_days ? Number(h.target_days) : 0;
                const progressCounter = (h.progress_counter !== null && h.progress_counter !== undefined)
                    ? Number(h.progress_counter)
                    : null;
                if (progressCounter !== null && targetDays > 0) {
                    return progressCounter < targetDays;
                }
                return true;
            }).length;
        }

    constructor(data = {}) {
        this.totalActivities = data.total_activity || 0;
        this.completedActivities = data.completed || 0;
        this.dailyTasksCount = data.daily_tasks_count || 0;
        this.monthlyEventsCount = data.monthly_events_count || 0;
        this.hardTasks = data.hard_tasks || 0;
        this.middleTasks = data.middle_tasks || 0;
        this.easyTasks = data.easy_tasks || 0;
        this.weeklyTasks = data.weekly_tasks || 0;
        this.weeklyCompleted = data.weekly_tasks_completed || 0;

        //frontend
        this.extra = {};
    }

    getWeeklyCompletionRate() {
        if (!this.weeklyTasks) return 0;
        return Math.round((this.weeklyCompleted / this.weeklyTasks) * 100);
    }

    getDailyCompletionRate() {
        if (!this.totalActivities) return 0;
        return Math.round((this.completedActivities / this.totalActivities) * 100);
    }

    getDifficultyDistribution() {
        const total = this.hardTasks + this.middleTasks + this.easyTasks;
        if (!total) return { hard: 0, middle: 0, easy: 0 };
        return {
            hard: Math.round((this.hardTasks / total) * 100),
            middle: Math.round((this.middleTasks / total) * 100),
            easy: Math.round((this.easyTasks / total) * 100)
        };
    }

    setExtra(key, value) {
        this.extra[key] = value;
    }

    getExtra(key) {
        return this.extra[key];
    }

    toJSON() {
        return {
            totalActivities: this.totalActivities,
            completedActivities: this.completedActivities,
            dailyTasksCount: this.dailyTasksCount,
            monthlyEventsCount: this.monthlyEventsCount,
            hardTasks: this.hardTasks,
            middleTasks: this.middleTasks,
            easyTasks: this.easyTasks,
            weeklyTasks: this.weeklyTasks,
            weeklyCompleted: this.weeklyCompleted,
            extra: this.extra
        };
    }
}