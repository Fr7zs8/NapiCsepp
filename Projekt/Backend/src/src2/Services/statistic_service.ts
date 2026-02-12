import { StatisticRepository } from "../Repositories/statistic_repository";

export class StatisticService {
  private repository: StatisticRepository;

  constructor() {
    this.repository = new StatisticRepository();
  }

  async systemStatistic(user_id:number) {
    if (user_id != 1) {
      throw new Error("Csak az admin kérheti le!");
    }
    const results = await this.repository.systemStatistic();
    if (!results || results.length === 0) {
      throw new Error("Nincs egy db statisztika se.");
    }
    return results;
  }

  async profileStatistic(user_id: number) {
    const results = await this.repository.profileStatistic(user_id);
    if (!results || results.length === 0) {
      throw new Error("Nincs egy db statisztika se.");
    }
    return results;
  }
}
