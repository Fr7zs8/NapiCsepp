import mysql from "mysql2/promise";
import config from "../config/config";
import { IDifficulty } from "../Models/difficulty_model";

export class DiffiCultyRepository {
  async getDifficulties(): Promise<IDifficulty[]> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT * FROM difficulties",
    )) as Array<any>;

    await connection.end();
    return results;
  }
}
