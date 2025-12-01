export interface IUser{
    user_id:number,
    username: string,
    email: string,
    password: string,
    language: string,
    role: string,
    register_date: Date,
    token: string | null
}

export class User implements IUser{
    user_id:number
    username: string
    email: string
    password: string
    language: string
    role: string
    register_date: Date
    token: string | null = null

    constructor(init:IUser){
        this.user_id = init.user_id,
        this.username = init.username,
        this.email = init.email,
        this.password = init.password,
        this.language = init.language,
        this.role = init.role,
        this.register_date = init.register_date
    }
}