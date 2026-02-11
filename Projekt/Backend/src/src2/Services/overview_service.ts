import { OverviewRepository } from "../Repositories/overview_repository";

export class OverviewService {
  private repository: OverviewRepository;

  constructor() {
    this.repository = new OverviewRepository();
  }

  async getOverview() {
    const results = await this.repository.getOverview();
    if (!results || results.length === 0) {
      throw new Error("Nincs semmi adat.");
    }
    return results;
  }
}
