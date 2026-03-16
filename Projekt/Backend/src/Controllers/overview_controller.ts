import { OverviewService } from "../Services/overview_service";
import { Response } from "express";

export class OverviewController {
  private service: OverviewService = new OverviewService();
  async getOverview(req: any, res: Response):Promise<void> {
    const id = Number(req.user.user_id);
    try {
      const results = await this.service.getOverview(id);
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
