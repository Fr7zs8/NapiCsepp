import mysql from "mysql2/promise"
import { Request, Response } from "express";
import config from "../config/config";

export async function getAllEvent(_req: Request, res: Response) {
    const connection = await mysql.createConnection(config.database);

    try {
        const [results] = await connection.query(
            'SELECT * FROM events'
        ) as Array<any>

        if (results.length > 0) {
            res.status(200).send(results);
            return
        }
        res.status(404).send("Nincs ilyen elem")
    } catch (err) {
        console.log(err);
    }
}