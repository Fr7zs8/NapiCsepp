import { UserRepository } from "../../src/Repositories/user_repository";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("UserRepository", () => {
  let repository: UserRepository;
  let mockConnection: any;

  beforeEach(() => {
    repository = new UserRepository();

    mockConnection = {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  test("login returns user id", async () => {
    mockConnection.query.mockResolvedValue([[{ id: 1 }]]);

    const result = await repository.login("test@test.com", "password");

    expect(mockConnection.query).toHaveBeenCalledWith(
      "SELECT login(?,?) as id",
      ["test@test.com", "password"],
    );
    expect(result).toBe(1);
  });

  test("login returns 0 when credentials are invalid", async () => {
    mockConnection.query.mockResolvedValue([[{ id: 0 }]]);

    const result = await repository.login("wrong@test.com", "wrongpassword");

    expect(result).toBe(0);
  });

  test("login throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.login("test@test.com", "password")).rejects.toThrow(
      "DB hiba",
    );
  });

  test("getUser returns user data", async () => {
    const mockData = [
      {
        user_id: 1,
        username: "TestUser",
        email: "test@test.com",
        language: "hu",
        role: "user",
        register_date: "2024-01-01",
      },
    ];

    mockConnection.query.mockResolvedValue([mockData]);

    const result = await repository.getUser(1);

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE users.user_id = ?"),
      [1],
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getUser throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.getUser(1)).rejects.toThrow("DB hiba");
  });

  test("getAllUser returns list of users", async () => {
    const mockData = [
      { user_id: 1, username: "User1", email: "user1@test.com" },
      { user_id: 2, username: "User2", email: "user2@test.com" },
    ];

    mockConnection.query.mockResolvedValue([mockData]);

    const result = await repository.getAllUser();

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT users.user_id"),
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getAllUser returns empty array when no users", async () => {
    mockConnection.query.mockResolvedValue([[]]);

    const result = await repository.getAllUser();

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("createUser returns insertId", async () => {
    mockConnection.query.mockResolvedValue([{ insertId: 5 }]);

    const mockUser = {
      username: "NewUser",
      email: "new@test.com",
      password: "password",
      language: "hu",
    };

    const result = await repository.createUser(
      mockUser as any,
      "user",
      "2024-01-01",
      "hu",
    );

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      [
        mockUser.username,
        mockUser.email,
        mockUser.password,
        mockUser.language,
        "user",
        "2024-01-01",
      ],
    );
    expect(result).toBe(5);
  });

  test("createUser throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(
      repository.createUser(
        { username: "User" } as any,
        "user",
        "2024-01-01",
        "hu",
      ),
    ).rejects.toThrow("DB hiba");
  });

  test("editUser updates user successfully as admin", async () => {
    const mockModerators = [{ user_id: 1, role: "admin" }];
    const mockResult = { affectedRows: 1 };

    mockConnection.query
      .mockResolvedValueOnce([mockModerators]) // getModerators
      .mockResolvedValueOnce([mockResult]); // UPDATE query

    const result = await repository.editUser(2, { username: "UpdatedUser" }, 1);

    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  test("editUser throws 404 when user object is empty", async () => {
    await expect(repository.editUser(1, {}, 1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs frissítendő adat!",
    });

    expect(mockConnection.query).not.toHaveBeenCalled();
  });

  test("editUser throws 403 when not admin or moderator", async () => {
    mockConnection.query.mockResolvedValueOnce([
      [{ user_id: 99, role: "user" }],
    ]);

    await expect(
      repository.editUser(2, { username: "UpdatedUser" }, 5),
    ).rejects.toMatchObject({
      status: 403,
      message: "Nincs jogosultságod szerkeszteni!",
    });

    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("editUser throws 404 when no rows affected", async () => {
    const mockModerators = [{ user_id: 1, role: "admin" }];

    mockConnection.query
      .mockResolvedValueOnce([mockModerators])
      .mockResolvedValueOnce([{ affectedRows: 0 }]);

    await expect(
      repository.editUser(99, { username: "UpdatedUser" }, 1),
    ).rejects.toMatchObject({
      status: 404,
      message: "Nincs ilyen user!",
    });

    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("editUser closes connection on error", async () => {
    mockConnection.query
      .mockResolvedValueOnce([[{ user_id: 1, role: "admin" }]])
      .mockRejectedValueOnce(new Error("DB hiba"));

    await expect(
      repository.editUser(2, { username: "UpdatedUser" }, 1),
    ).rejects.toThrow("DB hiba");

    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("getModerators returns list of moderators", async () => {
    const mockData = [
      { user_id: 1, username: "Admin", role: "admin" },
      { user_id: 2, username: "Mod", role: "moderator" },
    ];

    mockConnection.query.mockResolvedValue([mockData]);

    const result = await repository.getModerators();

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE users.role = 'moderator'"),
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getModerators returns empty array when none found", async () => {
    mockConnection.query.mockResolvedValue([[]]);

    const result = await repository.getModerators();

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("findByEmail returns user when found", async () => {
    const mockUser = {
      user_id: 1,
      email: "test@test.com",
      username: "TestUser",
    };

    mockConnection.query.mockResolvedValue([[mockUser]]);

    const result = await repository.findByEmail("test@test.com");

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE email = ?"),
      ["test@test.com"],
    );
    expect(result).toEqual(mockUser);
  });

  test("findByEmail returns null when not found", async () => {
    mockConnection.query.mockResolvedValue([[]]);

    const result = await repository.findByEmail("notfound@test.com");

    expect(result).toBeNull();
  });

  test("findByEmail throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.findByEmail("test@test.com")).rejects.toThrow(
      "DB hiba",
    );
  });

  test("deletUser returns result on success", async () => {
    const mockResult = { affectedRows: 1 };

    mockConnection.query.mockResolvedValue([mockResult]);

    const result = await repository.deleteUser(1);

    expect(mockConnection.query).toHaveBeenCalledWith(
      "DELETE FROM users WHERE users.user_id = ?",
      [1],
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  test("deletUser throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.deleteUser(1)).rejects.toThrow("DB hiba");
  });
});
