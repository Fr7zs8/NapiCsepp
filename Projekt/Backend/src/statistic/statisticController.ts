import { Response } from "express";
import mysql from "mysql2/promise";
import config from "../src2/config/config";

export async function systemStatistic(_req: any, res: Response) {
  const connect = await mysql.createConnection(config.database);

  try {
    const [rows] = (await connect.query(
      "CALL systemstatistic()",
    )) as Array<any>;
    console.log(rows);
    res.status(200).send(rows[0]);
  } catch (e) {
    console.log(e);
  }
}

export async function profileStatistic(req: any, res: Response) {
  const id = req.user.user_id;

  const connect = await mysql.createConnection(config.database);
  try {
    const [rows] = (await connect.query("CALL profile_statistic(?)", [
      id,
    ])) as Array<any>;

    const stats = rows[0] || {};

    res.status(200).send(stats);
  } catch (e) {
    console.log(e);
  }
}
