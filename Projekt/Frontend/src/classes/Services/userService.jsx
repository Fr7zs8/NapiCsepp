export default class UserService{

    constructor(apiService){
        this.apiService = apiService;
    }

    async login(email, password){
        const data = await this.apiService.post("/napicsepp/login", {email, password});

        if (data.token){
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("user", data.user);
        }

        return data;
    }

    getAllActivities(){
        return this.apiService.get("/napicsepp/activities");
    }

    createTask(taskData){

    }

    updateTask(taskId, data){

    }

    deleteTask(taskId){

    }

    createHabit(habitData){

    }

    deleteHabit(habitId){

    }
}