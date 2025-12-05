import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import config from "../config/config";
import { Request, Response } from "express";

export async function signIn(req:Request, res:Response){
    const {email, password} = req.body;
    
    if(!(email && password)) {
        res.status(400).send({error: "Nem megfelelők az adatok."})
        return;
    }

    const connection = await mysql.createConnection(config.database)
    try{
        const [results] = await connection.query("SELECT login(?,?) as id", [email, password]) as Array<any>

        if(!results[0].id){
            res.status(401).send({error: "Hiba"});
            return;
        }

        if(!config.jwtSecret){
            res.status(400).send({error: "Hiba van a titkos kulcsal"});
            return;
        }

        const token = jwt.sign({user_id:results[0].id}, config.jwtSecret, {expiresIn: "2h"});

        const [resultsdata] = await connection.query("SELECT email, user_id FROM users WHERE user_id = ?", [results[0].id]) as Array<any>

        res.status(200).send({token: token, data: resultsdata});
    }
    catch(e){
        console.log(e);
        return;
    }
}
