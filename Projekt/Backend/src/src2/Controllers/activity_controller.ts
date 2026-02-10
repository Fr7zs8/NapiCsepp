import { Response } from "express";
import * as service from "../Services/activity_service";

export async function getAllActivity(req: any, res: Response) {
  try {
    const userId = req.user.user_id;
    const results = await service.getAllActivities(userId);
    res.status(200).send(results);
  } catch (err: any) {
    res.status(404).send({ message: err.message });
  }
}
