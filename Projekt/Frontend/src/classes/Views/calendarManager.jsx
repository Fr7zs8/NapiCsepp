import Event from "./event";

export default class CalendarManager {
    constructor(currentDate, viewMode, activities, events) {
        this.currentDate = currentDate;
        this.viewMode = viewMode;
        this.activities = activities;
        this.events = (events || []).map(e => e instanceof Event ? e : new Event(
            e.event_id || e.eventId,
            e.event_name || e.eventName,
            e.event_start_time || e.startTime,
            e.event_end_time || e.endTime
        ));
    }

    setViewMode(mode) {
        this.viewMode = mode;
    }

    getMonthView(date = this.currentDate, activities = [], habits = []) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const today = new Date();
        const days = [];
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        const getTaskCount = (dateObj) => {
            return (activities || []).filter(a => {
                const isTask = (a.type_name || '').toLowerCase() !== 'szokás';
                if (!isTask || !a.activity_start_date) return false;
                const d = new Date(a.activity_start_date);
                return d.getFullYear() === dateObj.getFullYear() &&
                    d.getMonth() === dateObj.getMonth() &&
                    d.getDate() === dateObj.getDate();
            }).length;
        };

        const buildDay = (dateObj, isCurrentMonth) => ({
            date: dateObj,
            isCurrentMonth,
            isSunday: dateObj.getDay() === 0,
            isToday: dateObj.toDateString() === today.toDateString(),
            events: this.filterByDate(dateObj, this.events),
            activities: this.filterByDate(dateObj, activities),
            habits: this._filterHabitsByDate(dateObj, habits),
            taskCount: getTaskCount(dateObj)
        });

        for (let i = startDay; i > 0; i--) {
            days.push(buildDay(new Date(year, month, 1 - i), false));
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(buildDay(new Date(year, month, i), true));
        }
        const daysInLastRow = days.length % 7;
        if (daysInLastRow !== 0) {
            for (let i = 1; i <= 7 - daysInLastRow; i++) {
                days.push(buildDay(new Date(year, month + 1, i), false));
            }
        }
        return days;
    }

    _filterHabitsByDate(date, habits) {
        const target = new Date(date);
        return (habits || []).filter(h => {
            const startDate = h.activity_start_date || h.startDate;
            const endDate = h.activity_end_date || h.endDate;
            if (!startDate) return false;
            try {
                const sd = new Date(startDate + 'T00:00:00');
                const ed = endDate ? new Date(endDate + 'T23:59:59') : sd;
                return target >= sd && target <= ed;
            } catch {
                return false;
            }
        });
    }

    getWeekView(date = this.currentDate, selectedDate = null) {
        const startOfWeek = this.getStartOfWeek(date);
        const today = new Date();
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push({
                date: new Date(day),
                activities: this.filterByDate(day, this.activities),
                events: this.filterByDate(day, this.events),
                isToday: day.toDateString() === today.toDateString(),
                isSelected: selectedDate ? day.toDateString() === new Date(selectedDate).toDateString() : false
            });
        }
        return days;
    }

    getCombinedView(date = this.currentDate) {
        const weekDays = this.getWeekView(date);
        return {
            weekStart: weekDays[0].date,
            weekEnd: weekDays[6].date,
            activities: weekDays.flatMap(d => d.activities),
            events: weekDays.flatMap(d => d.events)
        };
    }

    getDayView(date = this.currentDate) {
        return {
            date: new Date(date),
            activities: this.filterByDate(date, this.activities),
            events: this.filterByDate(date, this.events)
        };
    }

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    filterByDate(date, items) {
        const target = new Date(date);
        const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        return (items || []).map(item => {
            if (item instanceof Event) return item;
            if (item.event_id || item.eventId) {
                return new Event(
                    item.event_id || item.eventId,
                    item.event_name || item.eventName,
                    item.event_start_time || item.startTime,
                    item.event_end_time || item.endTime
                );
            }
            return item;
        }).filter(item => {
            if (item instanceof Event) {
                if (!item.startTime) return false;
                const start = new Date(item.startTime);
                const end = item.endTime ? new Date(item.endTime) : start;
                const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                return targetDay >= startDay && targetDay <= endDay;
            }
            let itemDate = null;
            if (item.startTime) itemDate = new Date(item.startTime);
            else if (item.date) itemDate = new Date(item.date);
            else if (item.startDate) itemDate = new Date(item.startDate);
            else if (item.event_start_time) itemDate = new Date(item.event_start_time);
            if (!itemDate) return false;
            return itemDate.getFullYear() === target.getFullYear() &&
                   itemDate.getMonth() === target.getMonth() &&
                   itemDate.getDate() === target.getDate();
        });
    }
}
