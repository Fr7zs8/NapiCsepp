import Habit from "../classes/Views/habit";

export function isAchieved(activity) {
    return activity.activity_achive === 1 || activity.activity_achive === true || activity.activity_achive === "1";
}

export function calcTargetDays(item) {
    if (item.target_days || item.target_days === 0) {
        return Number(item.target_days);
    }
    if (item.activity_start_date && item.activity_end_date) {
        try {
            const sd = new Date(item.activity_start_date);
            const ed = new Date(item.activity_end_date);
            sd.setHours(0, 0, 0, 0);
            ed.setHours(0, 0, 0, 0);
            const diff = Math.floor((ed - sd) / (1000 * 60 * 60 * 24));
            return Math.max(0, diff + 1);
        } catch {
            return 0;
        }
    }
    return 0;
}

export function mapHabitItem(item) {
    return new Habit(
        item.activity_id,
        item.activity_name,
        item.type_name,
        item.difficulty_name,
        calcTargetDays(item),
        item.activity_start_date,
        item.activity_end_date,
        null,
        item.progress_counter,
    );
}

export function buildHabitMap(allActivities, habitsData) {
    const habitMap = {};
    habitsData.forEach((h) => {
        const checkedCount = allActivities.filter(
            (a) => a.type_name === "Szokás" && a.activity_name === h.activity_name && isAchieved(a)
        ).length;
        const targetDays = calcTargetDays(h);
        const daysElapsed = h.progress_counter != null
            ? Math.max(0, Number(h.progress_counter))
            : checkedCount;
        habitMap[h.activity_name] = { targetDays, daysElapsed };
    });
    return habitMap;
}

export function dispatchActivityEvents() {
    window.dispatchEvent(new Event("activitiesUpdated"));
    window.dispatchEvent(new Event("itemSaved"));
}
