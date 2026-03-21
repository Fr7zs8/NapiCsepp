import { EventController } from "../../src/Controllers/event_controller";
import { EventService } from "../../src/Services/event_service";

jest.mock("../../src/Services/event_service");

describe("EventController", () => {
  let controller: EventController;
  let mockService: jest.Mocked<EventService>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockService = new EventService() as jest.Mocked<EventService>;
    controller = new EventController();

    // @ts-ignore
    controller.service = mockService;

    req = {
      user: { user_id: 1 },
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("getEvent returns 200 and data", async () => {
    const mockData = [{ event_id: 1, event_name: "Futóverseny" }];

    mockService.getEvent.mockResolvedValue(mockData as any);

    await controller.getEvent(req, res);

    expect(mockService.getEvent).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("getEvent handles 500 error without status", async () => {
    mockService.getEvent.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("getEvent handles error with status and message", async () => {
    mockService.getEvent.mockRejectedValue({
      status: 400,
      message: "Bad Request",
    });

    await controller.getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Bad Request" });
  });

  test("getEvent handles 500 error without message", async () => {
    mockService.getEvent.mockRejectedValue({});

    await controller.getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("postEvent returns 200 on success", async () => {
    mockService.postEvent.mockResolvedValue(10);

    req.body = {
      event_name: "Futóverseny",
      event_start_time: "2024-01-01",
      event_end_time: "2024-01-02",
    };

    await controller.postEvent(req, res);

    expect(mockService.postEvent).toHaveBeenCalledWith(req.body, 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Sikeres adatrögzítés!");
  });

  test("postEvent handles 400 error", async () => {
    mockService.postEvent.mockRejectedValue({
      status: 400,
      message: "Hiányzó event adat.",
    });

    await controller.postEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Hiányzó event adat." });
  });

  test("postEvent handles 500 error", async () => {
    mockService.postEvent.mockRejectedValue({
      status: 500,
      message: "Az event mentése sikertelen.",
    });

    await controller.postEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Az event mentése sikertelen.",
    });
  });

  test("postEvent handles error with status and message", async () => {
    mockService.postEvent.mockRejectedValue({
      status: 400,
      message: "Bad Request",
    });

    await controller.postEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Bad Request" });
  });

  test("postEvent handles 500 error without message", async () => {
    mockService.postEvent.mockRejectedValue({});

    await controller.postEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("deleteEvent returns 200 on success", async () => {
    mockService.deleteEvent.mockResolvedValue({ affectedRows: 1 } as any);

    req.params.id = "1";

    await controller.deleteEvent(req, res);

    expect(mockService.deleteEvent).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Sikeres törlés.");
  });

  test("deleteEvent handles 400 error", async () => {
    mockService.deleteEvent.mockRejectedValue({
      status: 400,
      message: "Nem megfelelő az id tipusa!",
    });

    req.params.id = "0";

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nem megfelelő az id tipusa!",
    });
  });

  test("deleteEvent handles 404 error", async () => {
    mockService.deleteEvent.mockRejectedValue({
      status: 404,
      message: "Nem volt változtatás.",
    });

    req.params.id = "99";

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: "Nem volt változtatás." });
  });

  test("deleteEvent handles error with status and message", async () => {
    mockService.deleteEvent.mockRejectedValue({
      status: 400,
      message: "Bad Request",
    });

    req.params.id = "0";

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Bad Request" });
  });

  test("deleteEvent handles 500 error without message", async () => {
    mockService.deleteEvent.mockRejectedValue({});

    req.params.id = "1";

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("putEvent returns 200 on success", async () => {
    mockService.putEvent.mockResolvedValue({ affectedRows: 1 } as any);

    req.params.id = "1";
    req.body = { event_name: "Új név" };

    await controller.putEvent(req, res);

    expect(mockService.putEvent).toHaveBeenCalledWith(
      1,
      { event_name: "Új név" },
      1,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Sikeres módosítás!");
  });

  test("putEvent handles 400 error", async () => {
    mockService.putEvent.mockRejectedValue({
      status: 400,
      message: "Hibás formátumú azonosító!",
    });

    req.params.id = "abc";

    await controller.putEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hibás formátumú azonosító!",
    });
  });

  test("putEvent handles 404 error", async () => {
    mockService.putEvent.mockRejectedValue({
      status: 404,
      message: "Nincs frissítendő mező vagy nem található az esemény!",
    });

    req.params.id = "99";

    await controller.putEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs frissítendő mező vagy nem található az esemény!",
    });
  });

  test("putEvent handles 500 error without status", async () => {
    mockService.putEvent.mockRejectedValue(new Error("Ismeretlen hiba"));

    req.params.id = "1";

    await controller.putEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("putEvent handles error with status and message", async () => {
    mockService.putEvent.mockRejectedValue({
      status: 400,
      message: "Bad Request",
    });

    req.params.id = "1";

    await controller.putEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Bad Request" });
  });

  test("putEvent handles 500 error without message", async () => {
    mockService.putEvent.mockRejectedValue({});

    req.params.id = "1";

    await controller.putEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });
});
