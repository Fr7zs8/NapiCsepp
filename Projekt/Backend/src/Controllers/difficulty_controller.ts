import { DifficultyService } from "../Services/difficulty_service";
import { Response } from "express";

const service: DifficultyService = new DifficultyService();

export class DifficultyController {
  async getDifficulties(_req: any, res: Response) {
    try {
      const results = await service.getDifficulties();
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
