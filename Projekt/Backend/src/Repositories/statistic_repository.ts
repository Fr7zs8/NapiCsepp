import mysql from "mysql2/promise";
import config from "../config/config";

export class StatisticRepository {
  async systemStatistic() {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "CALL systemstatistic()",
    )) as Array<any>;

    await connection.end();
    return results[0];
  }

  async profileStatistic(user_id: number) {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query("CALL profile_statistic(?)", [
      user_id,
    ])) as Array<any>;

    await connection.end();
    return results[0];
  }
}
