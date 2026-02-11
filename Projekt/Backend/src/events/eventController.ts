import { Event } from "./event";
import mysql from "mysql2/promise";
import { Request, Response } from "express";
import config from "../src2/config/config";

export async function getEvent(req: any, res: Response) {
  const id = req.user.user_id;
  const connection = await mysql.createConnection(config.database);

  try {
    const [results] = (await connection.query(
      "SELECT events.event_name, DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i') AS event_start_time , DATE_FORMAT(events.event_end_time, '%Y-%m-%d %H:%i') AS event_end_time FROM events JOIN users_events ON users_events.event_id = events.event_id JOIN users ON users_events.user_id = users.user_id WHERE users.user_id = ?",
      [id],
    )) as Array<any>;

    if (results.length > 0) {
      res.status(200).send(results);
      return;
    }
    res.status(404).send("Nincs egy db event se.");
  } catch (err) {
    console.log(err);
  }
}

export async function postEvent(req: any, res: Response) {
  const newelem: Event = req.body;

  if (!newelem) {
    res.status(400).send("Érvénytelen bemeneti adatok.");
    return;
  }

  if (newelem.event_name === undefined || newelem.event_name === "") {
    res.status(400).send("Érvénytelen bemeneti adatok.");
    return;
  }

  const connection = await mysql.createConnection(config.database);
  try {
    const [results] = (await connection.query(
      "INSERT INTO events (event_name, event_start_time, event_end_time) VALUES (?,?,?)",
      [newelem.event_name, newelem.event_start_time, newelem.event_end_time],
    )) as Array<any>;
    const [results2] = (await connection.query(
      "INSERT INTO users_events (user_id, event_id) VALUES (?,?)",
      [req.user.user_id, results.insertId],
    )) as Array<any>;
    if (results.affectedRows > 0 && results2.affectedRows > 0) {
      res.status(201).send("Sikeres adatrögzités!");
    }
  } catch (e) {
    console.log(e);
  }
}

export const deleteEvent = async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).send({ error: 400, message: "Hibás formátumú azonosító!" });
    return;
  }
  const connection = await mysql.createConnection(config.database);

  try {
    const [resultsevent] = (await connection.query(
      "DELETE FROM users_events WHERE event_id = ?",
      [id],
    )) as Array<any>;
    const [results] = (await connection.query(
      "DELETE FROM events WHERE event_id = ?",
      [id],
    )) as Array<any>;

    if (results.affectedRows > 0 && resultsevent.affectedRows > 0) {
      res.status(200).send("Sikeres törlés.");
      return;
    }
  } catch (err) {
    console.log(err);
  }
  res.status(404).send("Sikertelen törlés");
};

export async function putEvent(req: Request, res: Response) {
  const id: number = parseInt(req.params.id);
  const event = req.body;

  if (isNaN(id)) {
    res.status(400).send({ error: 400, message: "Hibás formátumú azonosító!" });
    return;
  }

  if (!req.body) {
    res
      .status(400)
      .send({ error: 400, messege: "Nem küldte el az adatokat megfelelően!" });
    return;
  }

  const allowedFields = ["event_name", "event_start_time", "event_end_time"];

  const keys = Object.keys(event).filter((key) => allowedFields.includes(key));

  if (keys.length === 0) {
    res.status(400).send({ error: 400, messege: "Nincs frissítendő mező!" });
    return;
  }

  const updateString = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => event[key]);
  values.push(id);
  const sql = `update events set ${updateString} where event_id = ?`;

  const connection = await mysql.createConnection(config.database);

  try {
    const [results] = (await connection.query(sql, values)) as Array<any>;
    if (results.affectedRows > 0) {
      res
        .status(201)
        .send(`Sikeresen módosított ${results.affectedRows} elemet`);
      return;
    }
    postEvent(req, res);
  } catch (err) {
    console.log(err);
  }
}
