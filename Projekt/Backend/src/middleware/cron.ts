import mysql from "mysql2/promise";
import config from "../config/config";

export async function resetHabitState() {
  const connection = await mysql.createConnection(config.database);

  try {
    const [results] = await connection.query(
      "UPDATE activities SET activities.progress_counter = activities.progress_counter + 1 WHERE activities.activity_achive = 1",
    );

    const [result] = await connection.query(
      "UPDATE activities SET activities.activity_achive = 0 WHERE activities.activity_type_id = 4",
    );

    console.log(result);
    console.log(results);
    console.log("A cron lefutott");
  } catch (e) {
    console.log(e);
  }
}
