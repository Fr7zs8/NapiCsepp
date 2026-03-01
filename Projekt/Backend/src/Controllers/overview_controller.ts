import { OverviewService } from "../Services/overview_service";
import { Response } from "express";

const service: OverviewService = new OverviewService();

export class OverviewController {
  async getOverview(req: any, res: Response) {
    const id = Number(req.user.user_id);
    try {
      const results = await service.getOverview(id);
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
