import mysql from "mysql2/promise";
import config from "../config/config";
import { IOverview } from "../Models/overview_model";

export class OverviewRepository {
  async getOverview(user_id: number): Promise<IOverview[]> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query("CALL overview(?)", [
      user_id,
    ])) as Array<any>;

    await connection.end();
    return results[0];
  }
}
