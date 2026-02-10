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

export async function getHabits(req: any, res: Response) {
  try {
    const userId = req.user.user_id;
    const results = await service.getHabits(userId);
    res.status(200).send(results);
  } catch (err: any) {
    res.status(404).send({ message: err.message });
  }
}

export async function postActivity(req: any, res: Response) {
  try {
    const userId = req.user.user_id;
    const newelem = req.body;
    await service.postActivity(newelem, userId);
    res.status(200).send("Sikeres adatrögzítés!");
  } catch (err: any) {
    res.status(400).send({ message: err.message });
  }
}

export async function deleteActivity(req: any, res: Response) {
  try {
    const activity_id = req.params.id;
    await service.deleteActivity(activity_id);
    res.status(200).send("Sikeres törlés.");
  } catch (err: any) {
    res.status(400).send({ message: err.message });
  }
}
