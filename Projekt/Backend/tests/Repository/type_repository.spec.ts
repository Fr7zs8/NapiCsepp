import { TypeRepository } from "../../src/Repositories/type_repository";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("TypeRepository", () => {
  let repository: TypeRepository;
  let mockConnection: any;

  beforeEach(() => {
    repository = new TypeRepository();

    mockConnection = {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  test("getTypes returns list of types", async () => {
    const mockData = [
      { id: 1, name: "Cardio" },
      { id: 2, name: "Strength" },
    ];

    mockConnection.query.mockResolvedValue([mockData]);

    const result = await repository.getTypes();

    expect(mysql.createConnection).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM types");
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getTypes returns empty array when no data", async () => {
    mockConnection.query.mockResolvedValue([[]]);

    const result = await repository.getTypes();

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("getTypes throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.getTypes()).rejects.toThrow("DB hiba");
  });
});
