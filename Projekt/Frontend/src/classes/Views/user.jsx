export default class User{
    constructor(user_id, email, password, username, role, register_date){
        this.user_id = user_id,
        this.email = email,
        this.password = password,
        this.username = username,
        this.role = role,
        this.register_date = register_date
    }

    getActivities(){

    }

    isAdmin(){

    }

    toJSON(){
        
    }
}