import mysql from "mysql2/promise";
import config from "../../config/config";

export class DiffiCultyRepository {
  async getDifficulties() {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT * FROM difficulties",
    )) as Array<any>;

    await connection.end();
    return results;
  }
}
