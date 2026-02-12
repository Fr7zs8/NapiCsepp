import { EventService } from "../Services/event_service";
import { Response } from "express";

const service: EventService = new EventService();

export class EventController {
  async getEvent(req: any, res: Response) {
    try {
      const userId = req.user.user_id;
      const results = await service.getEvent(userId);
      res.status(200).send(results);
    } catch (err: any) {
      res.status(404).send({ message: err.message });
    }
  }

  async postEvent(req: any, res: Response) {
    try {
      const userId = req.user.user_id;
      const newelem = req.body;
      await service.postEvent(newelem, userId);
      res.status(200).send("Sikeres adatrögzítés!");
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }

  async deleteEvent(req: any, res: Response) {
    try {
      const activity_id = req.params.id;
      await service.deleteEvent(activity_id);
      res.status(200).send("Sikeres törlés.");
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }

  async putEvent(req: any, res: Response) {
    try {
      const activityId = Number(req.params.id);
      const updateData = req.body;
      await service.putEvent(activityId, updateData);
      res.status(200).send("Sikeres módosítás!");
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }
}
