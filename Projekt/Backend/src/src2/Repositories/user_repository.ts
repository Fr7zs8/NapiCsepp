import mysql from "mysql2/promise";
import config from "../config/config";
import { User } from "../Models/user_model";

export class UserRepository {
  async login(email: string, password: string) {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query("SELECT login(?,?) as id", [
      email,
      password,
    ])) as Array<any>;

    return results[0].id;
  }

  async getUser(user_id: number) {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT users.user_id, users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users WHERE users.user_id = ?",
      [user_id],
    )) as Array<any>;

    await connection.end();
    return results;
  }

  async getAllUser() {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users",
    )) as Array<any>;

    await connection.end();
    return results;
  }

  async createUser(user: User, role: string, date: string) {
    const connection = await mysql.createConnection(config.database);
    const [results] = (await connection.query(
      "INSERT INTO users (username, email, password, language, role, register_date) VALUES (?,?,?,?,?,?)",
      [user.username, user.email, user.password, user.language, role, date],
    )) as Array<any>;

    return results.insertId;
  }
}
