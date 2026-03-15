import { StatisticService } from "../Services/statistic_service";
import { Response } from "express";

export class StatisticController {
  private service: StatisticService = new StatisticService();
  async systemStatistic(req: any, res: Response) {
    const id = req.user.user_id;
    try {
      const results = await this.service.systemStatistic(id);
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async profileStatistic(req: any, res: Response) {
    const id = req.user.user_id;
    try {
      const results = await this.service.profileStatistic(id);
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async userProfileStatistic(req: any, res: Response) {
    const adminId = req.user.user_id;
    const targetUserId = Number(req.params.id);
    try {
      const results = await this.service.userProfileStatistic(
        adminId,
        targetUserId,
      );
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
