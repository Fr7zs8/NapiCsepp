import { Response } from "express";
import mysql from "mysql2/promise";
import config from "../config/config";

export async function systemStatistic(_req:any, res:Response){

    const connect = await mysql.createConnection(config.database);

    try{
        const stats = [];

        const [total_users] = await connect.query("SELECT COUNT(users.user_id) AS total_users FROM users") as Array<any>;

        const [total_activity_today] = await connect.query("SELECT COUNT(activities.activity_id) AS total_activity_today FROM activities WHERE DATE(activities.activity_start_date) = CURDATE();") as Array<any>;

        const [total_activity] = await connect.query("SELECT COUNT(activities.activity_id) AS total_activity FROM activities") as Array<any>;

        const [total_habits] = await connect.query("SELECT COUNT(activities.activity_id) AS total_habits FROM activities JOIN types ON activities.activity_type_id = types.type_id WHERE types.type_name = \"szokás\"") as Array<any>;

        stats.push({
            total_users: total_users[0].total_users,
            total_activity_today: total_activity_today[0].total_activity_today,
            total_activity: total_activity[0].total_activity,
            total_habits: total_habits[0].total_habits
        });
        
        res.status(200).send(stats);

    }
    catch (e){
        console.log(e);
    }
}

export async function profileStatistic(req:any, res:Response){
    //{ "total_habits": 5, "completed": 10, "daily_tasks_count": 7,"monthly_events_count": 10, "hard_tasks": 4, "middle_tasks": 3,"easy_tasks": 8, "weekly_tasks": 20, "weekly_completed": 10 }
    const id = req.user.user_id;

    const connect = await mysql.createConnection(config.database);
    try{
        const stats = [];

        const [total_activity] = await connect.query("SELECT COUNT(activities.activity_id) AS total_activity FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE users.user_id = ?", [id]) as Array<any>;

        const [completed] = await connect.query("SELECT COUNT(activities.activity_id) AS completed FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE users.user_id = ? AND activities.activity_achive = 1 ", [id]) as Array<any>;

        stats.push({
            total_activity: total_activity[0].total_activity || 0,
            completed: completed[0].completed || 0
        });
        res.status(200).send(stats)
    }
    catch (e){
        console.log(e);
    }
}