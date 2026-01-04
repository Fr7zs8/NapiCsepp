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
            res.status(401).send({error: "Rossz az email vagy a jelszó"});
            return;
        }

        if(!config.jwtSecret){
            res.status(401).send({error: "Hiba van a titkos kulcsal"});
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

export async function getUser(req: any, res: Response) {
    const id = req.user.user_id;
    const connection = await mysql.createConnection(config.database);

    try {
        const [results] = await connection.query(
            "SELECT users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users WHERE users.user_id = ?", [id]
        ) as Array<any>

        if (results.length > 0) {
            res.status(200).send(results);
            return
        }
        res.status(404).send("Nincs egy db user ezzel a névvel.")
    } catch (err) {
        console.log(err);
    }
}

export async function getAllUser(req: any, res: Response) {
    const id = req.user.user_id;

    if(id === 1){
        const connection = await mysql.createConnection(config.database);

        try {
            const [results] = await connection.query(
                "SELECT users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users"
            ) as Array<any>

            if (results.length > 0) {
                res.status(200).send(results);
                return
            }
            res.status(404).send("Nincs egy db user ezzel a névvel.")
        } catch (err) {
            console.log(err);
        }
    }

    res.status(401).send("Csak admin kérheti le.");

    
}