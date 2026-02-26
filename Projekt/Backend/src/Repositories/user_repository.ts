import mysql, { ResultSetHeader } from "mysql2/promise";
import config from "../config/config";
import { User } from "../Models/user_model";

export class UserRepository {
  async login(email: string, password: string): Promise<number> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query("SELECT login(?,?) as id", [
      email,
      password,
    ])) as Array<any>;

    return results[0].id;
  }

  async getUser(user_id: number): Promise<User> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT users.user_id, users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users WHERE users.user_id = ?",
      [user_id],
    )) as Array<any>;

    await connection.end();
    return results;
  }

  async getAllUser(): Promise<User[]> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT users.user_id, users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users",
    )) as Array<any>;

    await connection.end();
    return results;
  }

  async createUser(user: User, role: string, date: string): Promise<number> {
    const connection = await mysql.createConnection(config.database);
    const [results] = (await connection.query(
      "INSERT INTO users (username, email, password, language, role, register_date) VALUES (?,?,?,?,?,?)",
      [user.username, user.email, user.password, user.language, role, date],
    )) as Array<any>;

    return results.insertId;
  }

  async editUser(
    userId: number,
    user: Partial<User>,
    adminId: number,
  ): Promise<ResultSetHeader> {
    if (!user || Object.keys(user).length === 0) {
      throw new Error("Nincs frissítendő adat!");
    }

    const connection = await mysql.createConnection(config.database);

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (user.username !== undefined) {
        updateFields.push("username = ?");
        values.push(user.username);
      }

      if (user.email !== undefined) {
        updateFields.push("email = ?");
        values.push(user.email);
      }

      if (user.language !== undefined) {
        updateFields.push("language = ?");
        values.push(user.language);
      }

      if (user.role !== undefined && adminId == 1) {
        updateFields.push("role = ?");
        values.push(user.role);
      }

      if (user.password !== undefined) {
        updateFields.push("users.password =  pwd_encrypt(?)");
        values.push(user.password);
      }

      if (updateFields.length === 0) {
        throw new Error("Nincs frissítendő mező!");
      }

      values.push(userId);

      const sql = `
        UPDATE users
        SET ${updateFields.join(", ")}
        WHERE users.user_id = ?
      `;

      const [result]: any = await connection.query(sql, values);

      if (result.affectedRows === 0) {
        throw new Error("Nincs ilyen user!");
      }

      return result;
    } finally {
      await connection.end();
    }
  }

  async getModerators(): Promise<User[]> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "SELECT users.user_id, users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users WHERE users.role = 'moderator'",
    )) as Array<any>;

    await connection.end();
    return results;
  }

  async findByEmail(email: string): Promise<User | null> {
    const connection = await mysql.createConnection(config.database);
    const [rows]: any = await connection.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as User;
  }

  async deletUser(user_id: number): Promise<ResultSetHeader> {
    const connection = await mysql.createConnection(config.database);

    const [results] = (await connection.query(
      "DELETE FROM users WHERE users.user_id = ?",
      [user_id],
    )) as Array<any>;

    await connection.end();
    return results;
  }
}
