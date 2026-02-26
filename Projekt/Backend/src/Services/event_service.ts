import { EventRepository } from "../Repositories/event_repository";
import { Event, IEvent } from "../Models/event_model";
import { ResultSetHeader } from "mysql2";
import { HttpException } from "../middleware/error";

export class EventService {
  private repository: EventRepository = new EventRepository();

  constructor() {
    this.repository = new EventRepository();
  }

  async getEvent(userId: number): Promise<IEvent[]> {
    const results = await this.repository.getEvent(userId);

    return results;
  }

  async postEvent(newelem: Event, userId: number): Promise<number> {
    if (!newelem) {
      throw new HttpException(400, "Hiányzó event adat.");
    }
    const results = await this.repository.postEvent(newelem, userId);

    if (!results || results <= 0) {
      throw new HttpException(500, "Az event mentése sikertelen.");
    }

    return results;
  }

  async deleteEvent(event_id: number): Promise<ResultSetHeader> {
    const results = await this.repository.deleteEvent(event_id);

    if (isNaN(event_id)) {
      throw new HttpException(400, "Nem megfelelő az id tipusa!");
    }

    if (results.affectedRows <= 0) {
      throw new HttpException(404, "Nem volt változtatás.");
    }
    return results;
  }

  async putEvent(id: number, event: Partial<IEvent>): Promise<ResultSetHeader> {
    if (isNaN(id)) {
      throw new HttpException(400, "Hibás formátumú azonosító!");
    }

    if (!event || Object.keys(event).length === 0) {
      throw new HttpException(400, "Nem küldte el az adatokat megfelelően!");
    }

    const result = await this.repository.updateEvent(id, event);

    if (result.affectedRows === 0) {
      throw new HttpException(
        404,
        "Nincs frissítendő mező vagy nem található az esemény!",
      );
    }

    return result;
  }
}
