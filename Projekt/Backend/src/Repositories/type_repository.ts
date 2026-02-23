import mysql from "mysql2/promise";
import config from "../config/config";
import { IType } from "../Models/type_model";

export class TypeRepository {
  async getTypes(): Promise<IType[]> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT * FROM types",
    )) as Array<any>;

    await connection.end();
    return results;
  }
}
