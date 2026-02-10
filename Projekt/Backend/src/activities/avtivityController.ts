import mysql from "mysql2/promise";
import { Response } from "express";
import config from "../config/config";

export async function putActivity(req: any, res: Response) {
  const id = Number(req.params.id);
  const activity = req.body;

  if (isNaN(id)) {
    res.status(400).send({ error: 400, message: "Hibás formátumú azonosító!" });
    return;
  }

  if (!activity || Object.keys(activity).length === 0) {
    res.status(400).send({ error: 400, message: "Nincs frissítendő adat!" });
    return;
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (activity.activity_type_name) {
      const [rows]: any = await connection.query(
        "SELECT type_id FROM types WHERE type_name = ?",
        [activity.activity_type_name],
      );

      if (rows.length === 0) {
        res.status(400).send({ message: "Nincs ilyen típus!" });
        return;
      }

      updateFields.push("activity_type_id = ?");
      values.push(rows[0].type_id);
    }

    if (activity.activity_difficulty_name) {
      const [rows]: any = await connection.query(
        "SELECT difficulty_id FROM difficulties WHERE difficulty_name = ?",
        [activity.activity_difficulty_name],
      );

      if (rows.length === 0) {
        res.status(400).send({ message: "Nincs ilyen nehézség!" });
        return;
      }

      updateFields.push("activity_difficulty_id = ?");
      values.push(rows[0].difficulty_id);
    }

    if (activity.activity_name !== undefined) {
      updateFields.push("activity_name = ?");
      values.push(activity.activity_name);
    }

    if (activity.activity_achive !== undefined) {
      updateFields.push("activity_achive = ?");
      values.push(activity.activity_achive);
    }

    if (activity.activity_start_date !== undefined) {
      updateFields.push("activity_start_date = ?");
      values.push(activity.activity_start_date);
    }

    if (activity.activity_end_date !== undefined) {
      updateFields.push("activity_end_date = ?");
      values.push(activity.activity_end_date);
    }

    if (updateFields.length === 0) {
      res.status(400).send({ message: "Nincs frissítendő mező!" });
      return;
    }

    values.push(id);

    const sql = `
      UPDATE activities
      SET ${updateFields.join(", ")}
      WHERE activity_id = ?
    `;

    const [result]: any = await connection.query(sql, values);

    if (result.affectedRows === 0) {
      res.status(404).send({ message: "Nincs ilyen activity!" });
      return;
    }

    res.status(200).send("Sikeres módosítás");
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Szerver hiba" });
  } finally {
    await connection.end();
  }
}
