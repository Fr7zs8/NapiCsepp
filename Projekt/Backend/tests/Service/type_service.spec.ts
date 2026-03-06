import { TypeService } from "../../src/Services/type_service";
import { TypeRepository } from "../../src/Repositories/type_repository";
import { HttpException } from "../../src/middleware/error";

jest.mock("../../src/Repositories/type_repository");

describe("TypeService", () => {
  let service: TypeService;
  let mockRepository: jest.Mocked<TypeRepository>;

  beforeEach(() => {
    mockRepository = new TypeRepository() as jest.Mocked<TypeRepository>;
    service = new TypeService();

    // @ts-ignore
    service.repository = mockRepository;
  });

  // -------------------------------------------------------
  // GET TYPES
  // -------------------------------------------------------
  test("getTypes returns list of types", async () => {
    const mockData = [
      { id: 1, name: "Cardio" },
      { id: 2, name: "Strength" },
    ];

    mockRepository.getTypes.mockResolvedValue(mockData as any);

    const result = await service.getTypes();

    expect(mockRepository.getTypes).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getTypes throws 404 when result is empty array", async () => {
    mockRepository.getTypes.mockResolvedValue([]);

    await expect(service.getTypes()).rejects.toThrow(HttpException);
    await expect(service.getTypes()).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db típus se.",
    });
  });

  test("getTypes throws 404 when result is null", async () => {
    mockRepository.getTypes.mockResolvedValue(null as any);

    await expect(service.getTypes()).rejects.toThrow(HttpException);
    await expect(service.getTypes()).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db típus se.",
    });
  });

  test("getTypes propagates repository error", async () => {
    mockRepository.getTypes.mockRejectedValue(new Error("DB hiba"));

    await expect(service.getTypes()).rejects.toThrow("DB hiba");
  });
});
