    import Event from "./event";
    export default class CalendarManager{
        constructor(currentDate, viewMode, activities, events){
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

        setViewMode(mode){
            this.viewMode = mode;
        }

        getMonthView(date = this.currentDate, activities = [], habits = []) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        const today = new Date();
        const days = [];
        const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        const getTaskCount = (dateObj) => {
            return (activities || []).filter(a => {

                const typeName = (a.type_name || '').toLowerCase();
                const isTask = typeName !== 'szokás';
                const actDate = a.activity_start_date;
                if (!actDate) return false;
                const d = new Date(actDate);

                return isTask &&
                    d.getFullYear() === dateObj.getFullYear() &&
                    d.getMonth() === dateObj.getMonth() &&
                    d.getDate() === dateObj.getDate();
            }).length;
        };


        for (let i = startDay; i > 0; i--) {
            const prevDate = new Date(year, month, 1 - i);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                isSunday: prevDate.getDay() === 0,
                isToday: prevDate.toDateString() === today.toDateString(),
                events: this.filterByDate(prevDate, this.events),
                activities: this.filterByDate(prevDate, activities),
                habits: this._filterHabitsByDate(prevDate, habits),
                taskCount: getTaskCount(prevDate)
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            days.push({
                date: dateObj,
                isCurrentMonth: true,
                isSunday: dateObj.getDay() === 0,
                isToday: dateObj.toDateString() === today.toDateString(),
                events: this.filterByDate(dateObj, this.events),
                activities: this.filterByDate(dateObj, activities),
                habits: this._filterHabitsByDate(dateObj, habits),
                taskCount: getTaskCount(dateObj)
            });
        }

        const currentLength = days.length;
        const daysInLastRow = currentLength % 7;
        if (daysInLastRow !== 0) {
            const remainingDays = 7 - daysInLastRow;
            for (let i = 1; i <= remainingDays; i++) {
                const nextDate = new Date(year, month + 1, i);
                days.push({
                    date: nextDate,
                    isCurrentMonth: false,
                    isSunday: nextDate.getDay() === 0,
                    isToday: nextDate.toDateString() === today.toDateString(),
                    events: this.filterByDate(nextDate, this.events),
                    activities: this.filterByDate(nextDate, activities),
                    habits: this._filterHabitsByDate(nextDate, habits),
                    taskCount: getTaskCount(nextDate)
                });
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
            const days = [];
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                const isToday = day.toDateString() === today.toDateString();
                const isSelected = selectedDate ? (day.toDateString() === new Date(selectedDate).toDateString()) : false;
                days.push({
                    date: new Date(day),
                    activities: this.filterByDate(day, this.activities),
                    events: this.filterByDate(day, this.events),
                    isToday,
                    isSelected
                });
            }
            return days;
        }

        getCombinedView(date = this.currentDate) {
            const weekDays = this.getWeekView(date);
            let combinedActivities = [];
            let combinedEvents = [];
            weekDays.forEach(day => {
                combinedActivities = combinedActivities.concat(day.activities);
                combinedEvents = combinedEvents.concat(day.events);
            });
            return {
                weekStart: weekDays[0].date,
                weekEnd: weekDays[6].date,
                activities: combinedActivities,
                events: combinedEvents
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