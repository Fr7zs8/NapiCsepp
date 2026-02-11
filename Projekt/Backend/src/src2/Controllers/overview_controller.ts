import { OverviewService } from "../Services/overview_service";
import { Response } from "express";

const service: OverviewService = new OverviewService();

export class OverviewController {
  async getOverview(_req: any, res: Response) {
    try {
      const results = await service.getOverview();
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }
}
