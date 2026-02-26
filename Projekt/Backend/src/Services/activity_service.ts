import { ResultSetHeader } from "mysql2";
import { Activity } from "../Models/activity_model";
import { ActivityRepository } from "../Repositories/activity_repository";
import { HttpException } from "../middleware/error";

export class ActivityService {
  private repository: ActivityRepository;

  constructor() {
    this.repository = new ActivityRepository();
  }

  async getAllActivities(userId: number): Promise<Activity[]> {
    if (!userId || isNaN(userId)) {
      throw new HttpException(
        401,
        "Érvénytelen vagy hiányzó felhasználó azonosító!",
      );
    }

    const results = await this.repository.getAllActivitiesByUser(userId);
    return results;
  }

  async getHabits(userId: number): Promise<Activity[]> {
    if (!userId || isNaN(userId)) {
      throw new HttpException(
        401,
        "Érvénytelen vagy hiányzó felhasználó azonosító!",
      );
    }
    const results = await this.repository.getHabits(userId);
    return results;
  }

  async postActivity(newelem: Activity, userId: number): Promise<number> {
    if (!userId || isNaN(userId)) {
      throw new HttpException(401, "Érvénytelen user azonosító.");
    }

    if (!newelem) {
      throw new HttpException(400, "Hiányzó activity adat.");
    }

    const result = await this.repository.postActivity(newelem, userId);

    if (!result || result <= 0) {
      throw new HttpException(500, "Az activity mentése sikertelen.");
    }

    return result;
  }

  async deleteActivity(activity_id: number): Promise<ResultSetHeader> {
    if (!activity_id || isNaN(activity_id)) {
      throw new HttpException(400, "Nem megfelelő az activity ID.");
    }

    const result = await this.repository.deleteActivity(activity_id);

    if (!result || result.affectedRows <= 0) {
      throw new HttpException(404, "Az activity nem található.");
    }
    return result;
  }

  async putActivity(
    activityId: number,
    activity: Partial<Activity>,
    userId: number,
  ): Promise<ResultSetHeader> {
    if (!activityId || isNaN(activityId)) {
      throw new HttpException(400, "Nem megfelelő az activity ID.");
    }

    if (!activity || Object.keys(activity).length === 0) {
      throw new HttpException(400, "Nincs módosítandó adat.");
    }

    const result = await this.repository.putActivity(
      activityId,
      activity,
      userId,
    );

    if (!result || result.affectedRows <= 0) {
      throw new HttpException(404, "Az activity nem található.");
    }
    return result;
  }
}
