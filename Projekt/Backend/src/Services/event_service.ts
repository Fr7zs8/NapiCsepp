import { EventRepository } from "../Repositories/event_repository";
import { Event } from "../Models/event_model";
import { ResultSetHeader } from "mysql2";
import { HttpException } from "../middleware/error";

export class EventService {
  private repository: EventRepository = new EventRepository();

  constructor() {
    this.repository = new EventRepository();
  }

  async getEvent(userId: number): Promise<Event[]> {
    const results = await this.repository.getEvent(userId);

    return results;
  }

  async postEvent(newelem: Event, userId: number): Promise<number> {
    if (!newelem) {
      throw new HttpException(400, "Érvénytelen bemeneti adatok");
    }
    const results = await this.repository.postEvent(newelem, userId);

    if (!results || results === 0) {
      throw new HttpException(400, "Az event mentése sikertelen.");
    }

    return results;
  }

  async deleteEvent(event_id: number): Promise<ResultSetHeader> {
    if (!Number.isInteger(event_id) || event_id <= 0) {
      throw new HttpException(400, "Hibás formátumú azonosító!");
    }
    const results = await this.repository.deleteEvent(event_id);

    if (results.affectedRows <= 0) {
      throw new HttpException(404, "Sikertelen törlés");
    }
    return results;
  }

  async putEvent(
    id: number,
    event: Partial<Event>,
    userId: number,
  ): Promise<ResultSetHeader> {
    if (isNaN(id)) {
      throw new HttpException(400, "Hibás formátumú azonosító!");
    }

    if (!event || Object.keys(event).length === 0) {
      throw new HttpException(400, "Nem küldte el az adatokat megfelelően!");
    }

    const allowedKeys = ["event_name", "event_start_time", "event_end_time"];
    const validKeys = Object.keys(event).filter((k) => allowedKeys.includes(k));

    if (validKeys.length === 0) {
      throw new HttpException(400, "Nincs frissíthető mező!");
    }

    const result = await this.repository.updateEvent(id, event, userId);

    if (result.affectedRows === 0) {
      throw new HttpException(
        404,
        "Nincs frissítendő mező vagy nem található az esemény!",
      );
    }

    return result;
  }
}
