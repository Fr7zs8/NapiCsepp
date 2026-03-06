import { StatisticRepository } from "../../src/Repositories/statistic_repository";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("StatisticRepository", () => {
  let repository: StatisticRepository;
  let mockConnection: any;

  beforeEach(() => {
    repository = new StatisticRepository();

    mockConnection = {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  test("systemStatistic returns list of system statistics", async () => {
    const mockData = [
      { id: 1, total_users: 100, total_activities: 500 },
      { id: 2, total_users: 200, total_activities: 1000 },
    ];

    mockConnection.query.mockResolvedValue([[mockData]]);

    const result = await repository.systemStatistic();

    expect(mysql.createConnection).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.query).toHaveBeenCalledWith("CALL systemstatistic()");
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("systemStatistic returns empty array when no data", async () => {
    mockConnection.query.mockResolvedValue([[[]]]);

    const result = await repository.systemStatistic();

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("systemStatistic throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.systemStatistic()).rejects.toThrow("DB hiba");
  });

  test("profileStatistic returns list of profile statistics", async () => {
    const mockData = [
      { id: 1, activity_name: "Futás", count: 10 },
      { id: 2, activity_name: "Úszás", count: 5 },
    ];

    mockConnection.query.mockResolvedValue([[mockData]]);

    const result = await repository.profileStatistic(1);

    expect(mysql.createConnection).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.query).toHaveBeenCalledWith(
      "CALL profile_statistic(?)",
      [1],
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("profileStatistic returns empty array when no data", async () => {
    mockConnection.query.mockResolvedValue([[[]]]);

    const result = await repository.profileStatistic(1);

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("profileStatistic throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.profileStatistic(1)).rejects.toThrow("DB hiba");
  });
});
