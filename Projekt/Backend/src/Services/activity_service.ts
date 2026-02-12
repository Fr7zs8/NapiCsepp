import { Activity } from "../Models/activity_model";
import { ActivityRepository } from "../Repositories/activity_repository";

export class ActivityService {
  private repository: ActivityRepository;

  constructor() {
    this.repository = new ActivityRepository();
  }

  async getAllActivities(userId: number) {
    const results = await this.repository.getAllActivitiesByUser(userId);
    if (!results || results.length === 0) {
      throw new Error("Nincs egy db activity se.");
    }
    return results;
  }

  async getHabits(userId: number) {
    const results = await this.repository.getHabits(userId);

    if (!results || results.length === 0) {
      throw new Error("Nincs egy db habit se.");
    }
    return results;
  }

  async postActivity(newelem: Activity, userId: number) {
    const results = await this.repository.postActivity(newelem, userId);

    if (!results || results.affectedRows <= 0) {
      throw new Error("Nem modosult semmi.");
    }

    return results;
  }

  async deleteActivity(activity_id: number) {
    const results = await this.repository.deleteActivity(activity_id);

    if (isNaN(activity_id)) {
      throw new Error("Nem megfelelő az id tipusa!");
    }

    if (results.affectedRows <= 0) {
      throw new Error("Nem volt változtatás.");
    }
    return results;
  }

  async putActivity(activityId: number, activity: Partial<Activity>) {
    if (isNaN(activityId)) {
      throw new Error("Nem megfelelő az id tipusa!");
    }

    const result = await this.repository.putActivity(activityId, activity);

    if (!result || result.affectedRows <= 0) {
      throw new Error("Nem volt változtatás.");
    }

    return result;
  }
}
