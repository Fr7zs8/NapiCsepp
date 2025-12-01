import mysql from "mysql2/promise"
import { Request, Response } from "express";
import config from "../config/config";

export async function getEventByUser(req: Request, res: Response) {
    const id = req.params.id;
    const connection = await mysql.createConnection(config.database);

    try {
        const [results] = await connection.query(
            "SELECT events.event_name, events.event_start_time, events.event_end_time FROM events JOIN users_events ON users_events.event_id = events.event_id JOIN users ON users_events.user_id = users.user_id WHERE users.user_id = ?", [id]
        ) as Array<any>

        if (results.length > 0) {
            res.status(200).send(results);
            return
        }
        res.status(404).send("Nincs egy db event se.")
    } catch (err) {
        console.log(err);
    }
}