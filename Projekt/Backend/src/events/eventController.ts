import { Event } from './event';
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

export async function postEvents(req:Request, res:Response){
    const newelem:Event = req.body;

    if(!newelem){
        res.status(400).send("Érvénytelen bemeneti adatok.");
        return;
    }

    if(newelem.event_name === undefined || newelem.event_name === "" ){
        res.status(400).send("Érvénytelen bemeneti adatok.");
        return;
    }

    const connection = await mysql.createConnection(config.database);
    try{
        const [results] = await connection.query("INSERT INTO events (event_name, event_start_time, event_end_time) VALUES (?,?,?)", [newelem.event_name, newelem.event_start_time, newelem.event_end_time]) as Array<any>
        if(results.affectedRows > 0){
            res.status(201).send("Sikeres adatrögzités!");
        }
    }
    catch (e){
        console.log(e);
    }
}

export const deleteDataFromId = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id)

    if (isNaN(id)) {
        res.status(400).send({ error: 400, message: "Hibás formátumú azonosító!" })
        return
    }
    const connection = await mysql.createConnection(config.database);

    try {
        const [results] = await connection.query(
        "DELETE FROM users_events WHERE event_id = ?; DELETE FROM events WHERE event_id = ?",
        [id, id]
        ) as any;

        const usersEventsResult = results[0];
        const eventsResult = results[1];

        if (usersEventsResult.affectedRows > 0 || eventsResult.affectedRows > 0) {
            res.status(204).send("Sikeres törlés");
            return;
        }

    } catch (err) {
        console.log(err);
        
    }
    // res.status(404).send("Sikertelen törlés")

}