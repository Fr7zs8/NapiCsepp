import mysql from "mysql2/promise";
import config from "../config/config";

export class TypeRepository {
  async getTypes() {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT * FROM types",
    )) as Array<any>;

    await connection.end();
    return results;
  }
}
