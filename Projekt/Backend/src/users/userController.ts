import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import config from "../config/config";
import { Request, Response } from "express";
import { User } from "./user";

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

        res.status(200).send({token: token});
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

export async function regiszter(req:any, res:Response){
    //Validálni ha már létezik akkor ne hozza létre
    const newuser: User = req.body;

    if(!newuser){
        res.status(400).send("Érvénytelen bemeneti adatok.");
        return;
    }

    const connection = await mysql.createConnection(config.database);

    const datum = new Date(Date.now()).toLocaleString("sv-SE");
    const role = "user";

    try{
        const [results] = await connection.query("INSERT INTO users (username, email, password, language, role, register_date) VALUES (?,?,?,?,?,?)", [newuser.username, newuser.email, newuser.password, newuser.language, role, datum]) as Array<any>;

        if(results.affectedRows > 0){
            res.status(201).send("Sikeres adatrögzités!");
        }
    }
    catch (e){
        console.log(e);
    }
}