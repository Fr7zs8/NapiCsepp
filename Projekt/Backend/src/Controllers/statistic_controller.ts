import { StatisticService } from "../Services/statistic_service";
import { Response } from "express";

const service: StatisticService = new StatisticService();

export class StatisticController {
  async systemStatistic(req: any, res: Response) {
    const id = req.user.user_id
    try {
      const results = await service.systemStatistic(id);
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }

  async profileStatistic(req: any, res: Response) {
    const id = req.user.user_id;
    try {
      const results = await service.profileStatistic(id);
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }
}
