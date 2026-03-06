import { OverviewController } from "../../src/Controllers/overview_controller";
import { OverviewService } from "../../src/Services/overview_service";

jest.mock("../../src/Services/overview_service");

describe("OverviewController", () => {
  let controller: OverviewController;
  let mockService: jest.Mocked<OverviewService>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockService = new OverviewService() as jest.Mocked<OverviewService>;
    controller = new OverviewController();

    // @ts-ignore
    controller.service = mockService;

    req = {
      user: { user_id: 1 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  // -------------------------------------------------------
  // GET OVERVIEW
  // -------------------------------------------------------
  test("getOverview returns 200 and data", async () => {
    const mockData = [
      { id: 1, activity_name: "Futás", total: 5 },
      { id: 2, activity_name: "Úszás", total: 3 },
    ];

    mockService.getOverview.mockResolvedValue(mockData as any);

    await controller.getOverview(req, res);

    expect(mockService.getOverview).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("getOverview returns 200 with empty array", async () => {
    mockService.getOverview.mockResolvedValue([]);

    await controller.getOverview(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([]);
  });

  test("getOverview handles 500 error without status", async () => {
    mockService.getOverview.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.getOverview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });
});
