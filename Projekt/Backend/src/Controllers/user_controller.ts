import { User } from "../Models/user_model";
import { UserService } from "../Services/user_service";
import { Request, Response } from "express";

const service: UserService = new UserService();

export class UserController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!(email && password)) {
        res.status(400).send({ error: "Nem megfelelők az adatok." });
        return;
      }
      const token = await service.login(email, password);
      res.status(200).send({ token: token });
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }

  async getUser(req: any, res: Response) {
    const id = req.user.user_id;
    try {
      const results = await service.getUser(id);
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }

  async getAllUser(req: any, res: Response) {
    const id = req.user.user_id;
    try {
      const results = await service.getAllUser(id);
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const newUser: User = req.body;
      if (!newUser) {
        res.status(400).send("Érvénytelen bemeneti adatok.");
        return;
      }

      const success = await service.register(newUser);
      if (success) res.status(201).send("Sikeres adatrögzítés!");
    } catch (err: any) {
      res.status(400).send({ error: err.message });
    }
  }
}
