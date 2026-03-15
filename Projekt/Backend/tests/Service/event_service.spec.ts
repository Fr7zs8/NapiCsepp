import { EventService } from "../../src/Services/event_service";
import { EventRepository } from "../../src/Repositories/event_repository";

jest.mock("../../src/Repositories/event_repository");

describe("EventService", () => {
  let service: EventService;
  let mockRepository: jest.Mocked<EventRepository>;

  beforeEach(() => {
    mockRepository = new EventRepository() as jest.Mocked<EventRepository>;
    service = new EventService();

    // @ts-ignore
    service.repository = mockRepository;
  });

  test("getEvent returns list of events", async () => {
    const mockData = [
      { event_id: 1, event_name: "Futóverseny" },
      { event_id: 2, event_name: "Úszóverseny" },
    ];

    mockRepository.getEvent.mockResolvedValue(mockData as any);

    const result = await service.getEvent(1);

    expect(mockRepository.getEvent).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockData);
  });

  test("getEvent returns empty array", async () => {
    mockRepository.getEvent.mockResolvedValue([]);

    const result = await service.getEvent(1);

    expect(result).toEqual([]);
  });

  test("getEvent propagates repository error", async () => {
    mockRepository.getEvent.mockRejectedValue(new Error("DB hiba"));

    await expect(service.getEvent(1)).rejects.toThrow("DB hiba");
  });

  test("postEvent returns eventId on success", async () => {
    mockRepository.postEvent.mockResolvedValue(10);

    const mockEvent = {
      event_name: "Futóverseny",
      event_start_time: "2024-01-01",
      event_end_time: "2024-01-02",
    };

    const result = await service.postEvent(mockEvent as any, 1);

    expect(mockRepository.postEvent).toHaveBeenCalledWith(mockEvent, 1);
    expect(result).toBe(10);
  });

  test("postEvent throws 400 when newelem is null", async () => {
    await expect(service.postEvent(null as any, 1)).rejects.toMatchObject({
      status: 400,
      message: "Hiányzó event adat.",
    });

    expect(mockRepository.postEvent).not.toHaveBeenCalled();
  });

  test("postEvent throws 500 when repository returns 0", async () => {
    mockRepository.postEvent.mockResolvedValue(0);

    const mockEvent = {
      event_name: "Futóverseny",
      event_start_time: "2024-01-01",
      event_end_time: "2024-01-02",
    };

    await expect(service.postEvent(mockEvent as any, 1)).rejects.toMatchObject({
      status: 500,
      message: "Az event mentése sikertelen.",
    });
  });

  test("postEvent propagates repository error", async () => {
    mockRepository.postEvent.mockRejectedValue(new Error("DB hiba"));

    const mockEvent = {
      event_name: "Futóverseny",
      event_start_time: "2024-01-01",
      event_end_time: "2024-01-02",
    };

    await expect(service.postEvent(mockEvent as any, 1)).rejects.toThrow(
      "DB hiba",
    );
  });

  test("deleteEvent returns result on success", async () => {
    mockRepository.deleteEvent.mockResolvedValue({ affectedRows: 1 } as any);

    const result = await service.deleteEvent(1);

    expect(mockRepository.deleteEvent).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affectedRows: 1 });
  });

  test("deleteEvent throws 400 when id is not valid", async () => {
    await expect(service.deleteEvent(0)).rejects.toMatchObject({
      status: 400,
      message: "Nem megfelelő az id tipusa!",
    });

    expect(mockRepository.deleteEvent).not.toHaveBeenCalled();
  });

  test("deleteEvent throws 400 when id is negative", async () => {
    await expect(service.deleteEvent(-1)).rejects.toMatchObject({
      status: 400,
      message: "Nem megfelelő az id tipusa!",
    });

    expect(mockRepository.deleteEvent).not.toHaveBeenCalled();
  });

  test("deleteEvent throws 404 when no rows affected", async () => {
    mockRepository.deleteEvent.mockResolvedValue({ affectedRows: 0 } as any);

    await expect(service.deleteEvent(1)).rejects.toMatchObject({
      status: 404,
      message: "Nem volt változtatás.",
    });
  });

  test("deleteEvent propagates repository error", async () => {
    mockRepository.deleteEvent.mockRejectedValue(new Error("DB hiba"));

    await expect(service.deleteEvent(1)).rejects.toThrow("DB hiba");
  });

  test("putEvent returns result on success", async () => {
    mockRepository.updateEvent.mockResolvedValue({ affectedRows: 1 } as any);

    const result = await service.putEvent(1, { event_name: "Új név" }, 2);

    expect(mockRepository.updateEvent).toHaveBeenCalledWith(1, {
      event_name: "Új név",
    });
    expect(result).toEqual({ affectedRows: 1 });
  });

  test("putEvent throws 400 when id is NaN", async () => {
    await expect(
      service.putEvent(NaN, { event_name: "Új név" }, 2),
    ).rejects.toMatchObject({
      status: 400,
      message: "Hibás formátumú azonosító!",
    });

    expect(mockRepository.updateEvent).not.toHaveBeenCalled();
  });

  test("putEvent throws 400 when event is empty object", async () => {
    await expect(service.putEvent(1, {}, 2)).rejects.toMatchObject({
      status: 400,
      message: "Nem küldte el az adatokat megfelelően!",
    });

    expect(mockRepository.updateEvent).not.toHaveBeenCalled();
  });

  test("putEvent throws 400 when no valid fields", async () => {
    await expect(
      service.putEvent(1, { invalid_field: "érték" } as any, 2),
    ).rejects.toMatchObject({
      status: 400,
      message: "Nincs frissíthető mező!",
    });

    expect(mockRepository.updateEvent).not.toHaveBeenCalled();
  });

  test("putEvent throws 404 when no rows affected", async () => {
    mockRepository.updateEvent.mockResolvedValue({ affectedRows: 0 } as any);

    await expect(
      service.putEvent(1, { event_name: "Új név" }, 2),
    ).rejects.toMatchObject({
      status: 404,
      message: "Nincs frissítendő mező vagy nem található az esemény!",
    });
  });

  test("putEvent propagates repository error", async () => {
    mockRepository.updateEvent.mockRejectedValue(new Error("DB hiba"));

    await expect(
      service.putEvent(1, { event_name: "Új név" }, 2),
    ).rejects.toThrow("DB hiba");
  });
});
