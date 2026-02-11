import { Response } from "express";
import { ActivityService } from "../Services/activity_service";

const service: ActivityService = new ActivityService();

export class ActivityController {
  async getAllActivities(req: any, res: Response) {
    try {
      const userId = req.user.user_id;
      const results = await service.getAllActivities(userId);
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }

  async getHabits(req: any, res: Response) {
    try {
      const userId = req.user.user_id;
      const results = await service.getHabits(userId);
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }

  async postActivity(req: any, res: Response) {
    try {
      const userId = req.user.user_id;
      const newelem = req.body;
      await service.postActivity(newelem, userId);
      res.status(200).send("Sikeres adatrögzítés!");
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }

  async deleteActivity(req: any, res: Response) {
    try {
      const activity_id = req.params.id;
      await service.deleteActivity(activity_id);
      res.status(200).send("Sikeres törlés.");
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }

  async putActivity(req: any, res: Response) {
    try {
      const activityId = Number(req.params.id);
      const updateData = req.body;
      await service.putActivity(activityId, updateData);
      res.status(200).send("Sikeres módosítás!");
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }
}
