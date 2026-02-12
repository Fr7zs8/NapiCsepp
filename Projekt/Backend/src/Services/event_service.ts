import { EventRepository } from "../Repositories/event_repository";
import { Event, IEvent } from "../Models/event_model";

export class EventService {
  private repository: EventRepository = new EventRepository();

  constructor() {
    this.repository = new EventRepository();
  }

  async getEvent(userId: number) {
    const results = await this.repository.getEvent(userId);
    if (!results || results.length === 0) {
      throw new Error("Nincs egy db event se.");
    }
    return results;
  }

  async postEvent(newelem: Event, userId: number) {
    const results = await this.repository.postEvent(newelem, userId);

    if (!results || results.affectedRows <= 0) {
      throw new Error("Nem modosult semmi.");
    }

    return results;
  }

  async deleteEvent(event_id: number) {
    const results = await this.repository.deleteEvent(event_id);

    if (isNaN(event_id)) {
      throw new Error("Nem megfelelő az id tipusa!");
    }

    if (results.affectedRows <= 0) {
      throw new Error("Nem volt változtatás.");
    }
    return results;
  }

  async putEvent(id: number, event: Partial<IEvent>) {
    if (isNaN(id)) {
      throw { status: 400, message: "Hibás formátumú azonosító!" };
    }

    if (!event || Object.keys(event).length === 0) {
      throw { status: 400, message: "Nem küldte el az adatokat megfelelően!" };
    }

    const result = await this.repository.updateEvent(id, event);

    if (result.affectedRows === 0) {
      throw {
        status: 404,
        message: "Nincs frissítendő mező vagy nem található az esemény!",
      };
    }

    return result.affectedRows;
  }
}
