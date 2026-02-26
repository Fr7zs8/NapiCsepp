import User from "../Views/user";

export default class UserService{

    constructor(apiService){
        this.apiService = apiService;
    }


    async login(email, password){
        const data = await this.apiService.post("/napicsepp/login", {email, password});
        if (data.token){
            localStorage.setItem("authToken", data.token);
            
            try {
                const profile = await this.getProfile();
                console.log("Profil lekérése sikeres:", profile);
                
                if (profile && profile.user_id) {
                    localStorage.setItem("user", JSON.stringify(profile.toJSON()));
                    return profile;
                }
            } catch (e) {
                console.error("Profil lekérése sikertelen:", e);
            }
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
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("id");
    }


    async getProfile(){
        const data = await this.apiService.get("/napicsepp/profile");
        
        const userData = Array.isArray(data) ? data[0] : data;
        
        if (userData && userData.user_id) {
            return new User(
                userData.user_id,
                userData.email,
                undefined,
                userData.username,
                userData.role,
                userData.register_date
            );
        }
        return data;
    }

    getStatistics(){
        return this.apiService.get("/napicsepp/stats");
    }

    async updateProfile(data) {
        let user = null;
        const stored = localStorage.getItem("user");
        
        if (stored && stored !== "undefined") {
            try {
                user = JSON.parse(stored);
            } catch (err) {
                console.warn(err);
                user = null;
            }
        }
        
        if (Array.isArray(user)) {
            user = user[0];
        }
        
        let userId = user?.user_id || user?.userId;
        
        if (!userId) {
            const profile = await this.getProfile();
            userId = profile.user_id;
            if (userId) {
                user = profile.toJSON();
                localStorage.setItem("user", JSON.stringify(user));
            }
        }
        
        if (!userId) throw new Error("Felhasználó azonosító nem található!");
        const result = await this.apiService.put(`/napicsepp/users/${userId}`, data);
        
        const updated = { ...user, ...data };
        localStorage.setItem("user", JSON.stringify(updated));
        return result;
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

    async deleteUser(userId) {
        return await this.apiService.delete(`/napicsepp/users/${userId}`);
    }

    async editUser(userId, data) {
        return await this.apiService.put(`/napicsepp/users/${userId}`, data);
    }

    async getUserStatistics(userId) {
        return await this.apiService.get(`/napicsepp/stats/${userId}`);
    }

    async getSystemStats() {
        return await this.apiService.get("/napicsepp/system-stats");
    }
}