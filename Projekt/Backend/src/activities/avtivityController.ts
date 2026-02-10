import mysql from "mysql2/promise";
import { Response } from "express";
import config from "../config/config";
import { Activity } from "./activity";

export async function getAllActivity(req: any, res: Response) {
  const id = req.user.user_id;
  const connection = await mysql.createConnection(config.database);

  try {
    const [results] = (await connection.query(
      "SELECT activities.activity_id, activities.activity_type_id, activities.activity_name, types.type_name, difficulties.difficulty_name, activities.activity_achive, DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date, DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date FROM activities JOIN types on types.type_id = activities.activity_type_id JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id JOIN users_activities ON users_activities.activity_id = activities.activity_id JOIN users ON users.user_id = users_activities.user_id WHERE users.user_id = ?",
      [id]
    )) as Array<any>;

    if (results.length > 0) {
      res.status(200).send(results);
      return;
    }
    res.status(404).send("Nincs egy db activity se.");
  } catch (err) {
    console.log(err);
  }
}

export async function getHabits(req: any, res: Response) {
  const id = req.user.user_id;
  const connection = await mysql.createConnection(config.database);

  try {
    const [results] = (await connection.query(
      "SELECT activities.activity_id, activities.activity_name, DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date, DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date, DATEDIFF(activities.activity_end_date, activities.activity_start_date) AS target_days, activities.activity_achive, users.username, types.type_name, difficulties.difficulty_name FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users.user_id = users_activities.user_id JOIN types ON activities.activity_type_id = types.type_id JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id WHERE users.user_id = ? AND types.type_id = 4;",
      [id]
    )) as Array<any>;

    if (results.length > 0) {
      res.status(200).send(results);
      return;
    }
    res.status(404).send("Nincs egy db habit se.");
  } catch (err) {
    console.log(err);
  }
}

export async function postActivity(req: any, res: Response) {
  const newelem: Activity = req.body;

  if (!newelem) {
    res.status(400).send("Érvénytelen bemeneti adatok.");
    return;
  }

  if (newelem.activity_name === undefined || newelem.activity_name === "") {
    res.status(400).send("Érvénytelen bemeneti adatok.");
    return;
  }

  const connection = await mysql.createConnection(config.database);
  try {
    //Kezelni kell majd  Figyelj rá hogyan küldesz adatot
    const [typeid] = (await connection.query(
      "SELECT types.type_id FROM types WHERE types.type_name LIKE ? ;",
      [newelem.activity_type_name]
    )) as Array<any>;

    //Kezelni kell majd
    const [difficultyid] = (await connection.query(
      "SELECT difficulties.difficulty_id FROM difficulties WHERE difficulties.difficulty_name LIKE ?;",
      [newelem.activity_difficulty_name]
    )) as Array<any>;

    //Activity achive kezelni
    const [results] = (await connection.query(
      "INSERT INTO `activities` (`activity_name`, `activity_type_id`, `activity_difficulty_id`, `activity_achive`, `activity_start_date`, `activity_end_date`) VALUES (?, ?, ?, ?, ?, ?)",
      [
        newelem.activity_name,
        typeid[0].type_id,
        difficultyid[0].difficulty_id,
        newelem.activity_achive,
        newelem.activity_start_date,
        newelem.activity_end_date,
      ]
    )) as Array<any>;

    const [results2] = (await connection.query(
      "INSERT INTO `users_activities` (`user_id`, `activity_id`) VALUES (?,?)",
      [req.user.user_id, results.insertId]
    )) as Array<any>;

    if (results.affectedRows > 0 && results2.affectedRows > 0) {
      res.status(201).send("Sikeres adatrögzités!");
    }
  } catch (e) {
    console.log(e);
  }
}

export const deleteActivity = async (req: any, res: Response) => {
  const id: number = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).send({ error: 400, message: "Hibás formátumú azonosító!" });
    return;
  }
  const connection = await mysql.createConnection(config.database);

  try {
    const [results] = (await connection.query(
      "DELETE FROM activities WHERE activity_id = ?",
      [id]
    )) as Array<any>;

    if (results.affectedRows > 0) {
      res.status(200).send("Sikeres törlés.");
      return;
    }
  } catch (err) {
    console.log(err);
  }
  res.status(404).send("Sikertelen törlés");
};

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
        [activity.activity_type_name]
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
        [activity.activity_difficulty_name]
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
