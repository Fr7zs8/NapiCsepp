import User from "../Views/user";

export default class UserService{

    constructor(apiService){
        this.apiService = apiService;
    }


    async login(email, password){
        const data = await this.apiService.post("/napicsepp/login", {email, password});
        if (data.token){
            localStorage.setItem("authToken", data.token);
        }
        if (data.user) {
            const user = new User(
                data.user.user_id,
                data.user.email,
                undefined,
                data.user.username,
                data.user.role,
                data.user.register_date
            );
            localStorage.setItem("user", JSON.stringify(user.toJSON()));
            return user;
        }
        return data;
    }


    async register(username, email, password, language, role, registrationDate){
        const data = await this.apiService.post("/napicsepp/regisztrate", {username, email, password, language, role, registrationDate});
        if (data.user) {
            const user = new User(
                data.user.user_id,
                data.user.email,
                undefined,
                data.user.username,
                data.user.role,
                data.user.register_date
            );
            localStorage.setItem("user", JSON.stringify(user.toJSON()));
            return user;
        }
        return data;
    }


    logout(){
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
    }


    async getProfile(){
        const data = await this.apiService.get("/napicsepp/profile");
        if (data.user_id) {
            return new User(
                data.user_id,
                data.email,
                undefined,
                data.username,
                data.role,
                data.register_date
            );
        }
        return data;
    }

    getStatistics(){
        return this.apiService.get("/napicsepp/stats");
    }

    async getAllUsers() {
        const data = await this.apiService.get("/napicsepp/users");
        if (Array.isArray(data)) {
            return data.map(u =>
                new User(
                    u.user_id,
                    u.email,
                    undefined,
                    u.username,
                    u.role,
                    u.register_date
                )
            );
        }
        return [];
    }
}