import { ActivityController } from "../../src/Controllers/activity_controller";
import { ActivityService } from "../../src/Services/activity_service";

jest.mock("../../src/Services/activity_service");

describe("ActivityController", () => {
  let controller: ActivityController;
  let mockService: jest.Mocked<ActivityService>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockService = new ActivityService() as jest.Mocked<ActivityService>;
    controller = new ActivityController();

    // service private, felülírjuk
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

  test("getAllActivities returns 200 and data", async () => {
    mockService.getAllActivities.mockResolvedValue([{ id: 1 } as any]);

    await controller.getAllActivities(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([{ id: 1 } as any]);
  });

  test("getAllActivities handles error", async () => {
    mockService.getAllActivities.mockRejectedValue({
      status: 400,
      message: "Hiba",
    });

    await controller.getAllActivities(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Hiba" });
  });

  test("getHabits returns 200 and data", async () => {
    mockService.getHabits.mockResolvedValue([{ id: 2 } as any]);

    await controller.getHabits(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([{ id: 2 }]);
  });

  test("getHabits handles error", async () => {
    mockService.getHabits.mockRejectedValue({
      status: 500,
      message: "Hiba történt",
    });

    await controller.getHabits(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Hiba történt" });
  });

  test("postActivity returns 201 on success", async () => {
    mockService.postActivity.mockResolvedValue(10);

    req.body = { activity_name: "Test" };

    await controller.postActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Sikeres adatrögzítés!");
  });

  test("postActivity handles error", async () => {
    mockService.postActivity.mockRejectedValue({
      status: 400,
      message: "Hibás adat",
    });

    await controller.postActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Hibás adat" });
  });

  test("deleteActivity returns 200 on success", async () => {
    mockService.deleteActivity.mockResolvedValue({ affectedRows: 1 } as any);

    req.params.id = "5";

    await controller.deleteActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Sikeres törlés.");
  });

  test("deleteActivity handles error", async () => {
    mockService.deleteActivity.mockRejectedValue({
      status: 404,
      message: "Nem található",
    });

    req.params.id = "5";

    await controller.deleteActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: "Nem található" });
  });

  test("putActivity returns 200 on success", async () => {
    mockService.putActivity.mockResolvedValue({ affectedRows: 1 } as any);

    req.params.id = "3";
    req.body = { activity_name: "Updated" };

    await controller.putActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Sikeres módosítás!");
  });

  test("putActivity handles error", async () => {
    mockService.putActivity.mockRejectedValue({
      status: 400,
      message: "Hibás módosítás",
    });

    req.params.id = "3";

    await controller.putActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Hibás módosítás" });
  });
});
