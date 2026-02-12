export default class EventService {

    constructor(apiService){
        this.apiService = apiService;
    }


    async getOverview(){
        return this.apiService.get("/napicsepp/events");
    }

    async createEvent(data){
        return this.apiService.post("/napicsepp/event", data);
    }

    async updateEvent(id, data){
        if(!id) throw new Error("Event ID hiányzik!");
        return this.apiService.put(`/napicsepp/event/${id}`, data);
    }

    async deleteEvent(id){
        if(!id) throw new Error("Event ID hiányzik!");
        return this.apiService.delete(`/napicsepp/event/${id}`);
    }


    async getEventsByDate(date){
        const events = await this.getOverview();

        const dateStr = new Date(date)
            .toISOString()
            .split("T")[0];

        return events.filter(e => {
            const eventDate = new Date(e.event_start_time)
                .toISOString()
                .split("T")[0];

            return eventDate === dateStr;
        });
    }
}
