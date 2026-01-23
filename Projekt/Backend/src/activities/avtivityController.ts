import mysql from "mysql2/promise";
import { Response } from "express";
import config from "../config/config";
import { Activity } from "./activity";

export async function getAllActivity(req: any, res: Response) {
    const id = req.user.user_id;
    const connection = await mysql.createConnection(config.database);

    try {
        const [results] = await connection.query(
            "SELECT activities.activity_name, types.type_name, difficulties.difficulty_name, activities.activity_achive, DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date, DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date FROM activities JOIN types on types.type_id = activities.activity_type_id JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id JOIN users_activities ON users_activities.activity_id = activities.activity_id JOIN users ON users.user_id = users_activities.user_id WHERE users.user_id = ?", [id]
        ) as Array<any>

        if (results.length > 0) {
            res.status(200).send(results);
            return
        }
        res.status(404).send("Nincs egy db activity se.")
    } catch (err) {
        console.log(err);
    }
}

export async function getHabits(req: any, res: Response) {
    const id = req.user.user_id;
    const connection = await mysql.createConnection(config.database);

    try {
        const [results] = await connection.query(
            "SELECT activities.activity_name, DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date, DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date, activities.activity_achive, users.username, types.type_name, difficulties.difficulty_name FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users.user_id = users_activities.user_id JOIN types ON activities.activity_type_id = types.type_id JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id WHERE users.user_id = ? AND types.type_name LIKE 'szokas';", [id]
        ) as Array<any>

        if (results.length > 0) {
            res.status(200).send(results);
            return
        }
        res.status(404).send("Nincs egy db habit se.")
    } catch (err) {
        console.log(err);
    }
}

export async function postActivity(req:any, res:Response){
    const newelem:Activity = req.body;

    if(!newelem){
        res.status(400).send("Érvénytelen bemeneti adatok.");
        return;
    }

    if(newelem.activity_name === undefined || newelem.activity_name === "" ){
        res.status(400).send("Érvénytelen bemeneti adatok.");
        return;
    }

    const connection = await mysql.createConnection(config.database);
    try{
        //Kezelni kell majd  Figyelj rá hogyan küldesz adatot
        const [typeid] = await connection.query("SELECT types.type_id FROM types WHERE types.type_name LIKE ? ;", [newelem.activity_type_name]) as Array<any>;

        //Kezelni kell majd
        const [difficultyid] = await connection.query("SELECT difficulties.difficulty_id FROM difficulties WHERE difficulties.difficulty_name LIKE ?;", [newelem.activity_difficulty_name]) as Array<any>;

        //Activity achive kezelni
        const [results] = await connection.query("INSERT INTO `activities` (`activity_name`, `activity_type_id`, `activity_difficulty_id`, `activity_achive`, `activity_start_date`, `activity_end_date`) VALUES (?, ?, ?, ?, ?, ?)", [newelem.activity_name, typeid[0].type_id, difficultyid[0].difficulty_id, newelem.activity_achive, newelem.activity_start_date, newelem.activity_end_date]) as Array<any>

        const [results2] = await connection.query("INSERT INTO `users_activities` (`user_id`, `activity_id`) VALUES (?,?)", [req.user.user_id, results.insertId]) as Array<any>

        if(results.affectedRows > 0 && results2.affectedRows > 0){
            res.status(201).send("Sikeres adatrögzités!");
        }
    }
    catch (e){
        console.log(e);
    }
}

export const deleteActivity = async (req: any, res: Response) => {
    const id: number = parseInt(req.params.id)

    if (isNaN(id)) {
        res.status(400).send({ error: 400, message: "Hibás formátumú azonosító!" })
        return
    }
    const connection = await mysql.createConnection(config.database);

    try {
        const [results] = await connection.query("DELETE FROM activities WHERE activity_id = ?", [id]) as Array<any>;

        if(results.affectedRows > 0){
            res.status(200).send("Sikeres törlés.");
            return;
        }

    } catch (err) {
        console.log(err);
        
    }
    res.status(404).send("Sikertelen törlés")
}

export async function putActivity(req:any, res:Response){
    const id: number = parseInt(req.params.id);
    const activity = req.body;

    if(isNaN(id)){
        res.status(400).send({ error: 400, message: "Hibás formátumú azonosító!" })
        return;
    }

    if (!activity) {
        res.status(400).send({ error: 400, messege: "Nem küldte el az adatokat megfelelően!" })
        return
    }

    const allowedFields = ["activity_name", "activity_type_name", "activity_difficulty_name", "activity_achive", "activity_start_date", "activity_end_date"];

    const keys = Object.keys(activity).filter(key => allowedFields.includes(key));

    if (keys.length === 0 ) {
        res.status(400).send({ error: 103, messege: "Nincs frissítendő mező!" })
        return
    }

    const updateString = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => activity[key]);
    values.push(id);

    const sql = `update activities set ${updateString} where activity_id = ?`

    const connection = await mysql.createConnection(config.database);

    try{
        const [results] = await connection.query(sql, values) as Array<any>
        if(results.affectedRows > 0){
            res.status(200).send(`Sikeresen módosított ${results.affectedRows} elemet`)
            return
        }
        postActivity(req, res);
    }
    catch (e){
        console.log(e);
    }
}