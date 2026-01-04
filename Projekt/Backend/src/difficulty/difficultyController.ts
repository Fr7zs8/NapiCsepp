import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config/config";

export async function getDifficulties(_req: Request, res:Response){
    const connection = await mysql.createConnection(config.database);

    try{
        const [results] = await connection.query("SELECT difficulties.difficulty_name FROM difficulties") as Array<any>;
        const difficultyes = results.map((e: any) => e.difficulty_name)
        res.status(200).send(difficultyes);
    }
    catch (e){
        console.log(e);
    }
}