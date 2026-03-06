import { DifficultyService } from "../../src/Services/difficulty_service";
import { DiffiCultyRepository } from "../../src/Repositories/difficulty_repository";
import { HttpException } from "../../src/middleware/error";

jest.mock("../../src/Repositories/difficulty_repository");

describe("DifficultyService", () => {
  let service: DifficultyService;
  let mockRepository: jest.Mocked<DiffiCultyRepository>;

  beforeEach(() => {
    mockRepository =
      new DiffiCultyRepository() as jest.Mocked<DiffiCultyRepository>;
    service = new DifficultyService();

    // @ts-ignore
    service.repository = mockRepository;
  });
  test("getDifficulties returns list of difficulties", async () => {
    const mockData = [
      { id: 1, name: "Easy" },
      { id: 2, name: "Medium" },
    ];

    mockRepository.getDifficulties.mockResolvedValue(mockData as any);

    const result = await service.getDifficulties();

    expect(mockRepository.getDifficulties).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getDifficulties throws 404 when result is empty array", async () => {
    mockRepository.getDifficulties.mockResolvedValue([]);

    await expect(service.getDifficulties()).rejects.toThrow(HttpException);
    await expect(service.getDifficulties()).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db nehézség se.",
    });
  });

  test("getDifficulties throws 404 when result is null", async () => {
    mockRepository.getDifficulties.mockResolvedValue(null as any);

    await expect(service.getDifficulties()).rejects.toThrow(HttpException);
    await expect(service.getDifficulties()).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db nehézség se.",
    });
  });

  test("getDifficulties propagates repository error", async () => {
    mockRepository.getDifficulties.mockRejectedValue(new Error("DB hiba"));

    await expect(service.getDifficulties()).rejects.toThrow("DB hiba");
  });
});
