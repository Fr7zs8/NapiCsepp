import mysql, { ResultSetHeader } from "mysql2/promise";
import config from "../config/config";
import { Event, IEvent } from "../Models/event_model";

export class EventRepository {
  async getEvent(user_id: number): Promise<Event[]> {
    const connection = await mysql.createConnection(config.database);

    const [result] = (await connection.query("CALL pr_pullevent(?)", [
      user_id,
    ])) as Array<any>;

    await connection.end();
    return result[0];
  }

  async insertEvent(
    connection: mysql.Connection,
    newelem: Event,
    user_id: number,
  ): Promise<number> {
    const [result]: any = await connection.query(
      "INSERT INTO events (user_id, event_name, event_start_time, event_end_time) VALUES (?, ?, ?, ?)",
      [
        user_id,
        newelem.event_name,
        newelem.event_start_time,
        newelem.event_end_time,
      ],
    );
    return result.insertId;
  }

  async postEvent(newelem: Event, userId: number): Promise<number> {
    const connection = await mysql.createConnection(config.database);
    try {
      await connection.beginTransaction();
      const eventId = await this.insertEvent(connection, newelem, userId);
      await connection.commit();
      return eventId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.end();
    }
  }

  async deleteEvent(event_id: number): Promise<ResultSetHeader> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "DELETE FROM events WHERE event_id = ?",
      [event_id],
    )) as Array<any>;

    await connection.end();
    return results;
  }

  async updateEvent(
    id: number,
    event: Partial<IEvent>,
    userId: number,
  ): Promise<ResultSetHeader> {
    const allowedFields: (keyof IEvent)[] = [
      "event_name",
      "event_start_time",
      "event_end_time",
    ];
    const keys = Object.keys(event).filter((key) =>
      allowedFields.includes(key as keyof IEvent),
    ) as (keyof IEvent)[];

    const updateString = keys.map((key) => `${key} = ?`).join(", ");
    const values = keys.map((key) => event[key]);
    values.push(id);
    values.push(userId);

    const sql = `UPDATE events SET ${updateString} WHERE event_id = ? AND events.user_id = ?`;

    const connection = await mysql.createConnection(config.database);
    try {
      const [results] = (await connection.query(sql, values)) as Array<any>;
      return results;
    } finally {
      await connection.end();
    }
  }
}
