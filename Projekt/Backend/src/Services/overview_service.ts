import { IOverview } from "../Models/overview_model";
import { OverviewRepository } from "../Repositories/overview_repository";

export class OverviewService {
  private repository: OverviewRepository;

  constructor() {
    this.repository = new OverviewRepository();
  }

  async getOverview(user_id: number): Promise<IOverview[]> {
    const results = await this.repository.getOverview(user_id);
    return results;
  }
}
