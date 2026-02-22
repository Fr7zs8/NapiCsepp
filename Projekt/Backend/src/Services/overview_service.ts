import { HttpException } from "../middleware/error";
import { Overview } from "../Models/overview_model";
import { OverviewRepository } from "../Repositories/overview_repository";

export class OverviewService {
  private repository: OverviewRepository;

  constructor() {
    this.repository = new OverviewRepository();
  }

  async getOverview(): Promise<Overview[]> {
    const results = await this.repository.getOverview();
    if (!results || results.length === 0) {
      throw new HttpException(404, "Nincs semmi adat.");
    }
    return results;
  }
}
