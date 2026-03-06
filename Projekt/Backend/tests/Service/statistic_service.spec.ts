import { StatisticService } from "../../src/Services/statistic_service";
import { StatisticRepository } from "../../src/Repositories/statistic_repository";
import { UserRepository } from "../../src/Repositories/user_repository";

jest.mock("../../src/Repositories/statistic_repository");
jest.mock("../../src/Repositories/user_repository");

describe("StatisticService", () => {
  let service: StatisticService;
  let mockRepository: jest.Mocked<StatisticRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository =
      new StatisticRepository() as jest.Mocked<StatisticRepository>;
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    service = new StatisticService();

    // @ts-ignore
    service.repository = mockRepository;
    // @ts-ignore
    service.userrepository = mockUserRepository;
  });

  test("systemStatistic returns data for moderator", async () => {
    const mockData = [{ id: 1, total_users: 100 }];

    mockUserRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.systemStatistic.mockResolvedValue(mockData as any);

    const result = await service.systemStatistic(1);

    expect(mockUserRepository.getModerators).toHaveBeenCalled();
    expect(mockRepository.systemStatistic).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("systemStatistic throws 405 if not moderator", async () => {
    mockUserRepository.getModerators.mockResolvedValue([
      { user_id: 99 },
    ] as any);

    await expect(service.systemStatistic(1)).rejects.toMatchObject({
      status: 405,
      message: "Csak a moderátor kérheti le!",
    });

    expect(mockRepository.systemStatistic).not.toHaveBeenCalled();
  });

  test("systemStatistic throws 404 when result is empty", async () => {
    mockUserRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.systemStatistic.mockResolvedValue([]);

    await expect(service.systemStatistic(1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });
  });

  test("systemStatistic throws 404 when result is null", async () => {
    mockUserRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.systemStatistic.mockResolvedValue(null as any);

    await expect(service.systemStatistic(1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });
  });

  test("profileStatistic returns data for user", async () => {
    const mockData = [{ id: 1, activity_name: "Futás", count: 10 }];

    mockRepository.profileStatistic.mockResolvedValue(mockData as any);

    const result = await service.profileStatistic(1);

    expect(mockRepository.profileStatistic).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockData);
  });

  test("profileStatistic throws 404 when result is empty", async () => {
    mockRepository.profileStatistic.mockResolvedValue([]);

    await expect(service.profileStatistic(1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });
  });

  test("profileStatistic throws 404 when result is null", async () => {
    mockRepository.profileStatistic.mockResolvedValue(null as any);

    await expect(service.profileStatistic(1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });
  });

  test("userProfileStatistic returns data for moderator", async () => {
    const mockData = [{ id: 1, activity_name: "Úszás", count: 5 }];

    mockUserRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.profileStatistic.mockResolvedValue(mockData as any);

    const result = await service.userProfileStatistic(1, 2);

    expect(mockUserRepository.getModerators).toHaveBeenCalled();
    expect(mockRepository.profileStatistic).toHaveBeenCalledWith(2);
    expect(result).toEqual(mockData);
  });

  test("userProfileStatistic throws 403 if not moderator", async () => {
    mockUserRepository.getModerators.mockResolvedValue([
      { user_id: 99 },
    ] as any);

    await expect(service.userProfileStatistic(1, 2)).rejects.toMatchObject({
      status: 403,
      message: "Csak moderátor vagy admin kérheti le!",
    });

    expect(mockRepository.profileStatistic).not.toHaveBeenCalled();
  });

  test("userProfileStatistic throws 404 when result is empty", async () => {
    mockUserRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.profileStatistic.mockResolvedValue([]);

    await expect(service.userProfileStatistic(1, 2)).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });
  });

  test("userProfileStatistic throws 404 when result is null", async () => {
    mockUserRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.profileStatistic.mockResolvedValue(null as any);

    await expect(service.userProfileStatistic(1, 2)).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db statisztika se.",
    });
  });
});
