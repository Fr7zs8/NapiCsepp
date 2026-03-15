import { User } from "../Models/user_model";
import { UserRepository } from "../Repositories/user_repository";
import config from "../config/config";
import jwt from "jsonwebtoken";
import { HttpException } from "../middleware/error";
import { ResultSetHeader } from "mysql2";

export class UserService {
  private repository: UserRepository = new UserRepository();

  constructor() {
    this.repository = new UserRepository();
  }

  async login(email: string, password: string): Promise<string> {
    const user_id = await this.repository.login(email, password);

    if (!user_id) {
      throw new HttpException(401, "Rossz az email vagy a jelszó");
    }

    if (!config.jwtSecret) {
      throw new HttpException(401, "Hiba van a titkos kulcsal");
    }

    const token = jwt.sign({ user_id: user_id }, config.jwtSecret, {
      expiresIn: "2h",
    });

    return token;
  }

  async getUser(user_id: number): Promise<User> {
    const results = await this.repository.getUser(user_id);
    if (!results) {
      throw new HttpException(404, "Nincs egy db user ezzel a névvel.");
    }
    return results;
  }

  async getAllUser(user_id: number): Promise<User[]> {
    const moderators = await this.repository.getModerators();

    const isModerator = moderators.some(
      (m: { user_id: number }) => m.user_id == user_id,
    );

    if (!isModerator) {
      throw new HttpException(403, "Csak a moderátor kérheti le!");
    }
    const results = await this.repository.getAllUser();

    return results;
  }

  async register(user: User): Promise<number> {
    if (!user || !user.username || !user.email || !user.password) {
      throw new HttpException(400, "Hiányzó kötelező mező(k).");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new HttpException(400, "Érvénytelen email formátum.");
    }

    if (user.password.length < 5) {
      throw new HttpException(
        400,
        "A jelszónak legalább 6 karakter hosszúnak kell lennie.",
      );
    }

    const existingUser = await this.repository.findByEmail(user.email);

    if (existingUser) {
      throw new HttpException(409, "Az email cím már használatban van");
    }

    const date = new Date(Date.now()).toLocaleString("sv-SE");
    const role = "user";
    const language = "hu";
    const results = await this.repository.createUser(
      user,
      role,
      date,
      language,
    );

    return results;
  }

  async editUser(
    user: User,
    userId: number,
    admin_id: number,
  ): Promise<ResultSetHeader> {
    const results = await this.repository.editUser(userId, user, admin_id);

    if (!results) {
      throw new HttpException(400, "Nincs semmi változtatni való!");
    }

    return results;
  }

  async getmoderators(user_id: number): Promise<User[]> {
    if (user_id !== 1) {
      throw new HttpException(403, "Csak az admin kérheti le.");
    }
    const result = await this.repository.getModerators();

    if (result.length < 0) {
      throw new HttpException(404, "Nincs egy db moderátor se.");
    }

    return result;
  }

  async deleteUser(
    user_id: number,
    moderator_id: number,
  ): Promise<ResultSetHeader> {
    const moderators = await this.repository.getModerators();

    const isModerator = moderators.some(
      (m: { user_id: number }) => m.user_id == moderator_id,
    );

    if (!isModerator) {
      throw new HttpException(403, "Csak a moderátor kérheti le!");
    }

    const result = await this.repository.deletUser(user_id);

    if (!result || result.affectedRows <= 0) {
      throw new HttpException(404, "Az user nem található.");
    }
    return result;
  }
}
