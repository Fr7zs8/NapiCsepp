import { StatisticController } from "../../src/Controllers/statistic_controller";
import { StatisticService } from "../../src/Services/statistic_service";

jest.mock("../../src/Services/statistic_service");

describe("StatisticController", () => {
  let controller: StatisticController;
  let mockService: jest.Mocked<StatisticService>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockService = new StatisticService() as jest.Mocked<StatisticService>;
    controller = new StatisticController();

    // @ts-ignore
    controller.service = mockService;

    req = {
      user: { user_id: 1 },
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("systemStatistic returns 200 and data", async () => {
    const mockData = [{ id: 1, total_users: 100 }];

    mockService.systemStatistic.mockResolvedValue(mockData as any);

    await controller.systemStatistic(req, res);

    expect(mockService.systemStatistic).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("systemStatistic handles 405 error", async () => {
    mockService.systemStatistic.mockRejectedValue({
      status: 405,
      message: "Csak a moderátor kérheti le!",
    });

    await controller.systemStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.send).toHaveBeenCalledWith({
      message: "Csak a moderátor kérheti le!",
    });
  });

  test("systemStatistic handles 404 error", async () => {
    mockService.systemStatistic.mockRejectedValue({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });

    await controller.systemStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs egy db statisztika se.",
    });
  });

  test("systemStatistic handles 500 error without status", async () => {
    mockService.systemStatistic.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.systemStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("systemStatistic returns 500 and default message when error is empty object", async () => {
    mockService.systemStatistic.mockRejectedValue({});

    await controller.systemStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("profileStatistic returns 200 and data", async () => {
    const mockData = [{ id: 1, activity_name: "Futás", count: 10 }];

    mockService.profileStatistic.mockResolvedValue(mockData as any);

    await controller.profileStatistic(req, res);

    expect(mockService.profileStatistic).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("profileStatistic handles 404 error", async () => {
    mockService.profileStatistic.mockRejectedValue({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });

    await controller.profileStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs egy db statisztika se.",
    });
  });

  test("profileStatistic handles 500 error without status", async () => {
    mockService.profileStatistic.mockRejectedValue(
      new Error("Ismeretlen hiba"),
    );

    await controller.profileStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("profileStatistic returns 500 and default message when error is empty object", async () => {
    mockService.profileStatistic.mockRejectedValue({});

    await controller.profileStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("userProfileStatistic returns 200 and data", async () => {
    const mockData = [{ id: 1, activity_name: "Úszás", count: 5 }];

    mockService.userProfileStatistic.mockResolvedValue(mockData as any);

    req.params.id = "2";

    await controller.userProfileStatistic(req, res);

    expect(mockService.userProfileStatistic).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("userProfileStatistic handles 403 error", async () => {
    mockService.userProfileStatistic.mockRejectedValue({
      status: 403,
      message: "Csak moderátor vagy admin kérheti le!",
    });

    req.params.userId = "2";

    await controller.userProfileStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: "Csak moderátor vagy admin kérheti le!",
    });
  });

  test("userProfileStatistic handles 404 error", async () => {
    mockService.userProfileStatistic.mockRejectedValue({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });

    req.params.userId = "2";

    await controller.userProfileStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs egy db statisztika se.",
    });
  });

  test("userProfileStatistic handles 500 error without status", async () => {
    mockService.userProfileStatistic.mockRejectedValue(
      new Error("Ismeretlen hiba"),
    );

    req.params.userId = "2";

    await controller.userProfileStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("userProfileStatistic returns 500 and default message when error is empty object", async () => {
    mockService.userProfileStatistic.mockRejectedValue({});

    req.params.userId = "2";

    await controller.userProfileStatistic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });
});
