export default class ActivityService{

    constructor(apiService){
        this.apiService = apiService;
    }

    //mukodik
    getAllActivities(){
        return this.apiService.get("/napicsepp/activities");
    }

    //mukodik
    getAllHabits(){
        return this.apiService.get("/napicsepp/activities/habits");
    }

    getAllEvents(){
        return this.apiService.get("/napicsepp/events");
    }

    getAllDifficulties(){
        return this.apiService.get("/napicsepp/difficulties");
    }

    getAllTypes(){
        return this.apiService.get("/napicsepp/types");
    }

    createTask(taskData){
        return this.apiService.post("/napicsepp/activities", taskData);
    }

    updateTask(taskId, data){
        return this.apiService.put(`/napicsepp/activities/${taskId}`, data);
    }

    deleteTask(taskId){
        return this.apiService.delete(`/napicsepp/activities/${taskId}`);
    }

    createEvent(eventData){
        return this.apiService.post("/napicsepp/events", eventData);
    }

    deleteEvent(eventId){
        return this.apiService.delete(`/napicsepp/events/${eventId}`);
    }

    updateEvent(eventId, data){
        return this.apiService.put(`/napicsepp/events/${eventId}`, data);
    }

    createHabit(habitData){
        return this.apiService.post("/napicsepp/activities", habitData);
    }

    updateHabit(habitId, data){
        return this.apiService.put(`/napicsepp/activities/${habitId}`, data);
    }

    deleteHabit(habitId){
        return this.apiService.delete(`/napicsepp/activities/${habitId}`);
    }

}