export default class User{
    constructor(user_id, email, password, username, role, register_date){
        this.user_id = user_id,
        this.email = email,
        this.password = password,
        this.username = username,
        this.role = role,
        this.register_date = register_date
    }

    getActivities() {
        // Placeholder
        return [];
    }

    isAdmin() {
        return this.role === 'admin' || this.role === 'ADMIN';
    }

    toJSON() {
        return {
            user_id: this.user_id,
            email: this.email,
            username: this.username,
            role: this.role,
            register_date: this.register_date
        };
    }
}