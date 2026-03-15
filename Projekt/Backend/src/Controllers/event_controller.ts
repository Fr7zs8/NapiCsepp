import { EventService } from "../Services/event_service";
import { Response } from "express";

export class EventController {
  private service: EventService = new EventService();
  async getEvent(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user.user_id;
      const results = await this.service.getEvent(userId);
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async postEvent(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user.user_id;
      const newelem = req.body;
      await this.service.postEvent(newelem, userId);
      res.status(200).send("Sikeres adatrögzítés!");
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async deleteEvent(req: any, res: Response): Promise<void> {
    try {
      const activity_id = Number(req.params.id);
      await this.service.deleteEvent(activity_id);
      res.status(200).send("Sikeres törlés.");
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }

  async putEvent(req: any, res: Response): Promise<void> {
    try {
      const activityId = Number(req.params.id);
      const user_id = req.user.user_id;
      const updateData = req.body;
      await this.service.putEvent(activityId, updateData, user_id);
      res.status(200).send("Sikeres módosítás!");
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
