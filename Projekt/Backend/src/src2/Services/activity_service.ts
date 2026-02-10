import * as repository from "../Repositories/activity_repository";

export async function getAllActivities(userId: number) {
  const results = await repository.getAllActivitiesByUser(userId);
  if (!results || results.length === 0) {
    throw new Error("Nincs egy db activity se.");
  }
  return results;
}
