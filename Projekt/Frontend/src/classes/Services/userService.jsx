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

    register(username, email, password){
        return this.apiService.post("/napicsepp/register", {username, email, password});
    }

    logout(){
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
    }

    updateProfile(username, email, password){
        return this.apiService.put("/napicsepp/user/profile", {username, email, password});
    }

    getStatistics(){
        return this.apiService.get("/napicsepp/user/statistics");
    }
}