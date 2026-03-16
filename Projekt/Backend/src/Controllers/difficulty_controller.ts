import { DifficultyService } from "../Services/difficulty_service";
import { Response } from "express";

export class DifficultyController {
  private service: DifficultyService = new DifficultyService();
  async getDifficulties(_req: any, res: Response):Promise<void> {
    try {
      const results = await this.service.getDifficulties();
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
