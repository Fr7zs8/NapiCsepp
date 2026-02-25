import mysql from "mysql2/promise";
import config from "../config/config";

export async function resetHabitState() {
  const connection = await mysql.createConnection(config.database);

  try {

    const [rows] = await connection.query(`
      SELECT activity_id
      FROM activities
      WHERE activity_type_id = 4
      AND progress_counter <> (DATEDIFF(activity_end_date, activity_start_date) + 1)
    `) as Array<any>;

    if (rows.length === 0) {
      console.log("Minden progress elérte a maximumot. Nem fut le.");
      return;
    }

    await connection.query(`
      UPDATE activities
      SET progress_counter = progress_counter + 1
      WHERE activity_achive = 1
      AND progress_counter <> (DATEDIFF(activity_end_date, activity_start_date) + 1)
    `);

    await connection.query(`
      UPDATE activities
      SET activity_achive = 0
      WHERE activity_type_id = 4
    `);

    console.log("A cron lefutott");

  } catch (e) {
    console.log(e);
  } finally {
    await connection.end();
  }
}