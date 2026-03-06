import { DiffiCultyRepository } from "../../src/Repositories/difficulty_repository";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("DifficultyRepository", () => {
  let repository: DiffiCultyRepository;
  let mockConnection: any;

  beforeEach(() => {
    repository = new DiffiCultyRepository();

    mockConnection = {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  test("getDifficulties returns list of difficulties", async () => {
    const mockData = [
      { id: 1, name: "Easy" },
      { id: 2, name: "Medium" },
      { id: 3, name: "Hard" },
    ];

    mockConnection.query.mockResolvedValue([mockData]);

    const result = await repository.getDifficulties();

    expect(mysql.createConnection).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.query).toHaveBeenCalledWith(
      "SELECT * FROM difficulties",
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getDifficulties returns empty array when no data", async () => {
    mockConnection.query.mockResolvedValue([[]]);

    const result = await repository.getDifficulties();

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("getDifficulties closes connection on error", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.getDifficulties()).rejects.toThrow("DB hiba");
  });
});
