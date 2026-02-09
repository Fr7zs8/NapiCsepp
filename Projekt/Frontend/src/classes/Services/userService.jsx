export default class UserService{

    constructor(apiService){
        this.apiService = apiService;
    }

    async login(email, password){
        const data = await this.apiService.post("/napicsepp/login", {email, password});

        if (data.token){
            localStorage.setItem("authToken", data.token);
        }

        return data;
    }

    register(username, email, password, language, role, registrationDate){
        return this.apiService.post("/napicsepp/regisztrate", {username, email, password, language, role, registrationDate});
    }

    logout(){
        localStorage.removeItem("authToken");
    }

    getProfile(){
        return this.apiService.get("/napicsepp/profile");
    }

    getStatistics(){
        return this.apiService.get("/napicsepp/stats");
    }
}