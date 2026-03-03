import { HttpException } from "../middleware/error";
import { IProfileStats, ISystemStatistic } from "../Models/system_model";
import { StatisticRepository } from "../Repositories/statistic_repository";
import { UserRepository } from "../Repositories/user_repository";

export class StatisticService {
  private repository: StatisticRepository;
  private userrepository: UserRepository = new UserRepository();

  constructor() {
    this.repository = new StatisticRepository();
    this.userrepository = new UserRepository();
  }

  async systemStatistic(user_id: number): Promise<ISystemStatistic[]> {
    const moderators = await this.userrepository.getModerators();

    const isModerator = moderators.some(
      (m: { user_id: number }) => m.user_id == user_id,
    );

    if (!isModerator) {
      throw new HttpException(405, "Csak a moderátor kérheti le!");
    }
    const results = await this.repository.systemStatistic();
    if (!results || results.length === 0) {
      throw new HttpException(404, "Nincs egy db statisztika se.");
    }
    return results;
  }

  async profileStatistic(user_id: number): Promise<IProfileStats[]> {
    const results = await this.repository.profileStatistic(user_id);
    if (!results || results.length === 0) {
      throw new HttpException(404, "Nincs egy db statisztika se.");
    }
    return results;
  }

  async userProfileStatistic(adminId: number, targetUserId: number): Promise<IProfileStats[]> {
    const moderators = await this.userrepository.getModerators();
    const isModerator = moderators.some(
      (m: { user_id: number }) => m.user_id == adminId,
    );
    if (!isModerator) {
      throw new HttpException(403, "Csak moderátor vagy admin kérheti le!");
    }
    const results = await this.repository.profileStatistic(targetUserId);
    if (!results || results.length === 0) {
      throw new HttpException(404, "Nincs egy db statisztika se.");
    }
    return results;
  }
}
