import { TypeController } from "../../src/Controllers/type_controller";
import { TypeService } from "../../src/Services/type_service";

jest.mock("../../src/Services/type_service");

describe("TypeController", () => {
  let controller: TypeController;
  let mockService: jest.Mocked<TypeService>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockService = new TypeService() as jest.Mocked<TypeService>;
    controller = new TypeController();

    // @ts-ignore
    controller.service = mockService;

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("getTypes returns 200 and data", async () => {
    const mockData = [
      { id: 1, name: "Cardio" },
      { id: 2, name: "Strength" },
    ];

    mockService.getTypes.mockResolvedValue(mockData as any);

    await controller.getTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("getTypes handles 404 error", async () => {
    mockService.getTypes.mockRejectedValue({
      status: 404,
      message: "Nincs egy db típus se.",
    });

    await controller.getTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs egy db típus se.",
    });
  });

  test("getTypes handles 500 error without status", async () => {
    mockService.getTypes.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.getTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("getTypes handles 500 error without message", async () => {
    mockService.getTypes.mockRejectedValue({});

    await controller.getTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("getTypes handles error with status and message", async () => {
    mockService.getTypes.mockRejectedValue({
      status: 400,
      message: "Bad Request",
    });

    await controller.getTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Bad Request" });
  });
});
