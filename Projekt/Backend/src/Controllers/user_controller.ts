import { User } from "../Models/user_model";
import { UserService } from "../Services/user_service";
import { Request, Response } from "express";

export class UserController {
  private service: UserService = new UserService();

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!(email && password)) {
        res.status(400).send({ error: "Nem megfelelők az adatok." });
        return;
      }
      const token = await this.service.login(email, password);
      res.status(200).send({ token: token });
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async getUser(req: any, res: Response): Promise<void> {
    const id = req.user.user_id;
    try {
      const results = await this.service.getUser(id);
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async getAllUser(req: any, res: Response): Promise<void> {
    const id = req.user.user_id;
    try {
      const results = await this.service.getAllUser(id);
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const newUser: User = req.body;
      if (!newUser) {
        res.status(400).send("Érvénytelen bemeneti adatok.");
        return;
      }

      const success = await this.service.register(newUser);
      if (success) res.status(201).send("Sikeres adatrögzítés!");
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async putUser(req: any, res: Response): Promise<void> {
    try {
      const user_id = req.params.id;
      const user = req.body;
      const admin_id = req.user.user_id;

      const success = await this.service.editUser(user, user_id, admin_id);
      if (success) {
        res.status(200).send("Sikeres modositás!");
      }
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async getModerators(req: any, res: Response): Promise<void> {
    try {
      const admin_id: number = req.user.user_id;

      const success = await this.service.getModerators(admin_id);

      if (success) {
        res.status(200).send(success);
      }
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
  async deletUser(req: any, res: Response): Promise<void> {
    try {
      const user_id = req.params.id;
      const moderator_id = req.user.user_id;
      await this.service.deleteUser(user_id, moderator_id);
      res.status(200).send("Sikeres törlés.");
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
