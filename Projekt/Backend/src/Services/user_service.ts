import { User } from "../Models/user_model";
import { UserRepository } from "../Repositories/user_repository";
import config from "../config/config";
import jwt from "jsonwebtoken";

export class UserService {
  private repository: UserRepository = new UserRepository();

  constructor() {
    this.repository = new UserRepository();
  }

  async login(email: string, password: string) {
    const user_id = await this.repository.login(email, password);

    if (!user_id) {
      throw new Error("Rossz az email vagy a jelszó");
    }

    if (!config.jwtSecret) {
      throw new Error("Hiba van a titkos kulcsal");
    }

    const token = jwt.sign({ user_id: user_id }, config.jwtSecret, {
      expiresIn: "2h",
    });

    return token;
  }

  async getUser(user_id: number) {
    const results = await this.repository.getUser(user_id);
    if (!results || results.length === 0) {
      throw new Error("Nincs egy db user ezzel a névvel.");
    }
    return results;
  }

  async getAllUser(user_id: number) {
    if (user_id != 1) {
      throw new Error("Csak az admin kérheti le!");
    }
    const results = await this.repository.getAllUser();

    return results;
  }

  async register(user: User) {
    const date = new Date(Date.now()).toLocaleString("sv-SE");
    const role = "user";
    const results = await this.repository.createUser(user, role, date);

    return results;
  }
}
