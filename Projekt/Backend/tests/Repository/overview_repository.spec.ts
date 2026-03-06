import { OverviewRepository } from "../../src/Repositories/overview_repository";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("OverviewRepository", () => {
  let repository: OverviewRepository;
  let mockConnection: any;

  beforeEach(() => {
    repository = new OverviewRepository();

    mockConnection = {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  // -------------------------------------------------------
  // GET OVERVIEW
  // -------------------------------------------------------
  test("getOverview returns list of overview data", async () => {
    const mockData = [
      { id: 1, activity_name: "Futás", total: 5 },
      { id: 2, activity_name: "Úszás", total: 3 },
    ];

    mockConnection.query.mockResolvedValue([[mockData]]);

    const result = await repository.getOverview(1);

    expect(mysql.createConnection).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.query).toHaveBeenCalledWith("CALL overview(?)", [1]);
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getOverview returns empty array when no data", async () => {
    mockConnection.query.mockResolvedValue([[[]]]);

    const result = await repository.getOverview(1);

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("getOverview throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.getOverview(1)).rejects.toThrow("DB hiba");
  });
});
