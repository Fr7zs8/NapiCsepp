export default class Event{
    constructor(eventId, eventName, startTime, endTime){
        this.eventId = eventId,
        this.eventName = eventName,
        this.startTime = startTime,
        this.endTime = endTime
    }

    getDuration(){
        if (!this.startTime || !this.endTime) return null;
        const start = new Date(this.startTime);
        const end = new Date(this.endTime);
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return { hours, mins };
    }

    isToday(){
        if (!this.startTime) return false;
        const today = new Date();
        const start = new Date(this.startTime);
        return start.getFullYear() === today.getFullYear() &&
               start.getMonth() === today.getMonth() &&
               start.getDate() === today.getDate();
    }

    formatTime(){
        if (!this.startTime || !this.endTime) return '';
        const start = new Date(this.startTime);
        const end = new Date(this.endTime);
        const pad = n => n.toString().padStart(2, '0');
        return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
    }

    toJSON(){
        return {
            eventId: this.eventId,
            eventName: this.eventName,
            startTime: this.startTime,
            endTime: this.endTime
        };
    }
}