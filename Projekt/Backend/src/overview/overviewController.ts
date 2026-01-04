import { Response } from "express";


export async function getEveryThing(_req:any, res:Response){
    res.status(200).send("Átgonddolásra vár");
}