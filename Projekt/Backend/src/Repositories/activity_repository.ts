import mysql from "mysql2/promise";
import config from "../config/config";
import { Activity } from "../Models/activity_model";

export class ActivityRepository {
  async getAllActivitiesByUser(userId: number): Promise<Activity[]> {
    const connection = await mysql.createConnection(config.database);
    const [results] = (await connection.query("CALL pr_pullactivities(?)", [
      userId,
    ])) as Array<any>;

    await connection.end();
    return results[0];
  }

  async getHabits(userId: number): Promise<Activity[]> {
    const connection = await mysql.createConnection(config.database);

    const [result] = (await connection.query("CALL pr_pullhabits(?)", [
      userId,
    ])) as Array<any>;

    await connection.end();
    return result[0];
  }

  async deleteActivity(activity_id: number): Promise<mysql.ResultSetHeader> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "DELETE FROM activities WHERE activity_id = ?",
      [activity_id],
    )) as Array<any>;

    return results;
  }

  private async getTypeId(
    connection: mysql.Connection,
    typeName: string,
  ): Promise<number> {
    const [rows]: any = await connection.query(
      "SELECT type_id FROM types WHERE type_name = ?",
      [typeName],
    );

    if (rows.length === 0) {
      throw new Error("Nincs ilyen típus");
    }

    return rows[0].type_id;
  }

  private async getDifficultyId(
    connection: mysql.Connection,
    difficultyName: string,
  ): Promise<number> {
    const [rows]: any = await connection.query(
      "SELECT difficulty_id FROM difficulties WHERE difficulty_name = ?",
      [difficultyName],
    );

    if (rows.length === 0) {
      throw new Error("Nincs ilyen nehézség");
    }

    return rows[0].difficulty_id;
  }

  private async linkUserToActivity(
    connection: mysql.Connection,
    userId: number,
    activityId: number,
  ): Promise<void> {
    await connection.query(
      "INSERT INTO users_activities (user_id, activity_id) VALUES (?, ?)",
      [userId, activityId],
    );
  }

  private async insertActivity(
    connection: mysql.Connection,
    newelem: Activity,
    typeId: number,
    difficultyId: number,
  ): Promise<number> {
    const [result]: any = await connection.query(
      `INSERT INTO activities 
       (activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter)
       VALUES (?, ?, ?, ?, ?, ?,?)`,
      [
        newelem.activity_name,
        typeId,
        difficultyId,
        newelem.activity_achive,
        newelem.activity_start_date,
        newelem.activity_end_date,
        newelem.progress_counter,
      ],
    );

    return result.insertId;
  }

  async postActivity(newelem: Activity, userId: number): Promise<number> {
    const connection = await mysql.createConnection(config.database);

    try {
      await connection.beginTransaction();

      const typeId = await this.getTypeId(
        connection,
        newelem.activity_type_name,
      );
      const difficultyId = await this.getDifficultyId(
        connection,
        newelem.activity_difficulty_name,
      );

      const activityId = await this.insertActivity(
        connection,
        newelem,
        typeId,
        difficultyId,
      );

      await this.linkUserToActivity(connection, userId, activityId);

      await connection.commit();

      return activityId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  }

  async putActivity(
    activityId: number,
    activity: Partial<Activity>,
    userId: number,
  ): Promise<mysql.ResultSetHeader> {
    if (!activity || Object.keys(activity).length === 0) {
      throw new Error("Nincs frissítendő adat!");
    }

    const connection = await mysql.createConnection(config.database);

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (activity.activity_type_name) {
        const typeId = await this.getTypeId(
          connection,
          activity.activity_type_name,
        );
        updateFields.push("activity_type_id = ?");
        values.push(typeId);
      }

      if (activity.activity_difficulty_name) {
        const difficultyId = await this.getDifficultyId(
          connection,
          activity.activity_difficulty_name,
        );
        updateFields.push("activity_difficulty_id = ?");
        values.push(difficultyId);
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

      if (activity.progress_counter !== undefined) {
        updateFields.push("progress_counter = ?");
        values.push(activity.progress_counter);
      }

      if (updateFields.length === 0) {
        throw new Error("Nincs frissítendő mező!");
      }

      values.push(activityId);
      values.push(userId);

      const sql = `
        UPDATE activities
        JOIN users_activities ON users_activities.activity_id = activities.activity_id
        SET ${updateFields.join(", ")}
        WHERE activities.activity_id = ? AND users_activities.user_id = ?
      `;

      const [result]: any = await connection.query(sql, values);

      if (result.affectedRows === 0) {
        throw new Error("Nincs ilyen activity!");
      }

      return result;
    } finally {
      await connection.end();
    }
  }
}
