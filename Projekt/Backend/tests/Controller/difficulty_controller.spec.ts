import { DifficultyController } from "../../src/Controllers/difficulty_controller";
import { DifficultyService } from "../../src/Services/difficulty_service";

jest.mock("../../src/Services/difficulty_service");

describe("DifficultyController", () => {
  let controller: DifficultyController;
  let mockService: jest.Mocked<DifficultyService>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockService = new DifficultyService() as jest.Mocked<DifficultyService>;
    controller = new DifficultyController();

    // @ts-ignore
    controller.service = mockService;

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });
  test("getDifficulties returns 200 and data", async () => {
    const mockData = [
      { id: 1, name: "Easy" },
      { id: 2, name: "Medium" },
    ];

    mockService.getDifficulties.mockResolvedValue(mockData as any);

    await controller.getDifficulties(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("getDifficulties handles 404 error", async () => {
    mockService.getDifficulties.mockRejectedValue({
      status: 404,
      message: "Nincs egy db nehézség se.",
    });

    await controller.getDifficulties(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs egy db nehézség se.",
    });
  });

  test("getDifficulties handles 500 error without status", async () => {
    mockService.getDifficulties.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.getDifficulties(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });
});
