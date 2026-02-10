import mysql from "mysql2/promise";
import config from "../../config/config";
import { Activity } from "../../activities/activity";

export async function getAllActivitiesByUser(userId: number) {
  const connection = await mysql.createConnection(config.database);
  const [results] = (await connection.query("CALL pr_pullactivities(?)", [
    userId,
  ])) as Array<any>;

  await connection.end();
  return results[0];
}

export async function getHabits(userId: number) {
  const connection = await mysql.createConnection(config.database);

  const [result] = (await connection.query("CALL pr_pullhabits(?)", [
    userId,
  ])) as Array<any>;

  await connection.end();
  return result[0];
}

export async function postActivity(newelem: Activity, userId: number) {
  const connection = await mysql.createConnection(config.database);

  try {
    await connection.beginTransaction();

    const [typeRows]: any = await connection.query(
      "SELECT type_id FROM types WHERE type_name = ?",
      [newelem.activity_type_name],
    );

    if (typeRows.length === 0) {
      throw new Error("Nincs ilyen típus");
    }

    const [difficultyRows]: any = await connection.query(
      "SELECT difficulty_id FROM difficulties WHERE difficulty_name = ?",
      [newelem.activity_difficulty_name],
    );

    if (difficultyRows.length === 0) {
      throw new Error("Nincs ilyen nehézség");
    }

    const [activityResult]: any = await connection.query(
      `INSERT INTO activities 
       (activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        newelem.activity_name,
        typeRows[0].type_id,
        difficultyRows[0].difficulty_id,
        newelem.activity_achive,
        newelem.activity_start_date,
        newelem.activity_end_date,
      ],
    );

    const [result] = (await connection.query(
      "INSERT INTO users_activities (user_id, activity_id) VALUES (?, ?)",
      [userId, activityResult.insertId],
    )) as Array<any>;

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

export async function deleteActivity(activity_id: number) {
  const connection = await mysql.createConnection(config.database);

  const [results] = (await connection.query(
    "DELETE FROM activities WHERE activity_id = ?",
    [activity_id],
  )) as Array<any>;

  return results;
}
