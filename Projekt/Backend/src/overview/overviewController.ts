import { Response } from "express";
import mysql from "mysql2/promise";
import config from "../config/config";

export async function getEveryThing(_req: any, res: Response) {
  const connection = await mysql.createConnection(config.database);
  try {
    const [result] = (await connection.query("CALL overview()")) as Array<any>;

    if (result.length > 0) {
      res.status(200).send(result[0]);
    }
  } catch (e) {
    console.log(e);
  }
}
