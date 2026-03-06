import { OverviewService } from "../../src/Services/overview_service";
import { OverviewRepository } from "../../src/Repositories/overview_repository";

jest.mock("../../src/Repositories/overview_repository");

describe("OverviewService", () => {
  let service: OverviewService;
  let mockRepository: jest.Mocked<OverviewRepository>;

  beforeEach(() => {
    mockRepository =
      new OverviewRepository() as jest.Mocked<OverviewRepository>;
    service = new OverviewService();

    // @ts-ignore
    service.repository = mockRepository;
  });

  // -------------------------------------------------------
  // GET OVERVIEW
  // -------------------------------------------------------
  test("getOverview returns list of overview data", async () => {
    const mockData = [
      { id: 1, activity_name: "Futás", total: 5 },
      { id: 2, activity_name: "Úszás", total: 3 },
    ];

    mockRepository.getOverview.mockResolvedValue(mockData as any);

    const result = await service.getOverview(1);

    expect(mockRepository.getOverview).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockData);
  });

  test("getOverview returns empty array", async () => {
    mockRepository.getOverview.mockResolvedValue([]);

    const result = await service.getOverview(1);

    expect(mockRepository.getOverview).toHaveBeenCalledWith(1);
    expect(result).toEqual([]);
  });

  test("getOverview propagates repository error", async () => {
    mockRepository.getOverview.mockRejectedValue(new Error("DB hiba"));

    await expect(service.getOverview(1)).rejects.toThrow("DB hiba");
  });
});
