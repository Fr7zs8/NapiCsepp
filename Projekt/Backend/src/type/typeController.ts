import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config/config";

export async function getTypes(_req: Request, res:Response){
    const connection = await mysql.createConnection(config.database);

    try{
        const [results] = await connection.query("SELECT types.type_name FROM types") as Array<any>;
        const types = results.map((e: any) => e.type_name)
        res.status(200).send(types);
    }
    catch (e){
        console.log(e);
    }
}