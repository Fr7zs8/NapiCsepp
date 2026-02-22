import mysql from "mysql2/promise";
import config from "../config/config";
import { Overview } from "../Models/overview_model";

export class OverviewRepository {
  async getOverview(): Promise<Overview[]> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query("CALL overview()")) as Array<any>;

    await connection.end();
    return results[0];
  }
}
