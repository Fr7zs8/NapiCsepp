import { Activity } from "../../activities/activity";
import * as repository from "../Repositories/activity_repository";

export async function getAllActivities(userId: number) {
  const results = await repository.getAllActivitiesByUser(userId);
  if (!results || results.length === 0) {
    throw new Error("Nincs egy db activity se.");
  }
  return results;
}

export async function getHabits(userId: number) {
  const results = await repository.getHabits(userId);

  if (!results || results.length === 0) {
    throw new Error("Nincs egy db habit se.");
  }
  return results;
}

export async function postActivity(newelem: Activity, userId: number) {
  const results = await repository.postActivity(newelem, userId);

  if (!results || results.affectedRows <= 0) {
    throw new Error("Nem modosult semmi.");
  }

  return results;
}

export async function deleteActivity(activity_id: number) {
  const results = await repository.deleteActivity(activity_id);

  if (isNaN(activity_id)) {
    throw new Error("Nem megfelelő az id tipusa!");
  }

  if (results.affectedRows <= 0) {
    throw new Error("Nem volt változtatás.");
  }
  return results;
}
