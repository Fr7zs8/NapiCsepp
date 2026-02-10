import mysql from "mysql2/promise";
import config from "../../config/config";

export async function getAllActivitiesByUser(userId: number) {
  const connection = await mysql.createConnection(config.database);
  const [results] = (await connection.query("CALL pr_pullactivities(?)", [
    userId,
  ])) as Array<any>;

  await connection.end();
  return results[0];
}
