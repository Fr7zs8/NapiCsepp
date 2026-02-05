import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config/config";

export async function getDifficulties(_req: Request, res:Response){
    const connection = await mysql.createConnection(config.database);

    try{
        const [results] = await connection.query("SELECT * FROM difficulties") as Array<any>;
        res.status(200).send(results);
    }
    catch (e){
        console.log(e);
    }
}