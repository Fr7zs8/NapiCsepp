import { UserService } from "../../src/Services/user_service";
import { UserRepository } from "../../src/Repositories/user_repository";
import { HttpException } from "../../src/middleware/error";
import jwt from "jsonwebtoken";
import config from "../../src/config/config";

jest.mock("../../src/Repositories/user_repository");
jest.mock("jsonwebtoken");

describe("UserService", () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = new UserRepository() as jest.Mocked<UserRepository>;
    service = new UserService();

    // @ts-ignore
    service.repository = mockRepository;

    (jwt.sign as jest.Mock).mockClear();
  });

  test("login returns token on success", async () => {
    mockRepository.login.mockResolvedValue(1);
    (jwt.sign as jest.Mock).mockReturnValue("mock_token");

    const result = await service.login("test@test.com", "password");

    expect(mockRepository.login).toHaveBeenCalledWith(
      "test@test.com",
      "password",
    );
    expect(jwt.sign).toHaveBeenCalledWith({ user_id: 1 }, config.jwtSecret, {
      expiresIn: "2h",
    });
    expect(result).toBe("mock_token");
  });

  test("login throws 401 when user_id is 0", async () => {
    mockRepository.login.mockResolvedValue(0);

    await expect(
      service.login("wrong@test.com", "wrong"),
    ).rejects.toMatchObject({
      status: 401,
      message: "Rossz az email vagy a jelszó",
    });

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test("login throws 401 when user_id is null", async () => {
    mockRepository.login.mockResolvedValue(null as any);

    await expect(
      service.login("wrong@test.com", "wrong"),
    ).rejects.toMatchObject({
      status: 401,
      message: "Rossz az email vagy a jelszó",
    });
  });

  test("login propagates repository error", async () => {
    mockRepository.login.mockRejectedValue(new Error("DB hiba"));

    await expect(service.login("test@test.com", "password")).rejects.toThrow(
      "DB hiba",
    );
  });

  test("getUser returns user data", async () => {
    const mockUser = {
      user_id: 1,
      username: "TestUser",
      email: "test@test.com",
    };

    mockRepository.getUser.mockResolvedValue(mockUser as any);

    const result = await service.getUser(1);

    expect(mockRepository.getUser).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });

  test("getUser throws 404 when result is null", async () => {
    mockRepository.getUser.mockResolvedValue(null as any);

    await expect(service.getUser(1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs egy db user ezzel a névvel.",
    });
  });

  test("getUser propagates repository error", async () => {
    mockRepository.getUser.mockRejectedValue(new Error("DB hiba"));

    await expect(service.getUser(1)).rejects.toThrow("DB hiba");
  });

  test("getAllUser returns list of users for moderator", async () => {
    const mockUsers = [
      { user_id: 1, username: "User1" },
      { user_id: 2, username: "User2" },
    ];

    mockRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.getAllUser.mockResolvedValue(mockUsers as any);

    const result = await service.getAllUser(1);

    expect(mockRepository.getModerators).toHaveBeenCalled();
    expect(mockRepository.getAllUser).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  test("getAllUser throws 403 when not moderator", async () => {
    mockRepository.getModerators.mockResolvedValue([{ user_id: 99 }] as any);

    await expect(service.getAllUser(1)).rejects.toMatchObject({
      status: 403,
      message: "Csak a moderátor kérheti le!",
    });

    expect(mockRepository.getAllUser).not.toHaveBeenCalled();
  });

  test("getAllUser propagates repository error", async () => {
    mockRepository.getModerators.mockRejectedValue(new Error("DB hiba"));

    await expect(service.getAllUser(1)).rejects.toThrow("DB hiba");
  });

  test("register creates user and returns id", async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.createUser.mockResolvedValue(5);

    const mockUser = {
      username: "NewUser",
      email: "new@test.com",
      password: "password",
      language: "hu",
    };

    const result = await service.register(mockUser as any);

    expect(mockRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(mockRepository.createUser).toHaveBeenCalledWith(
      mockUser,
      "user",
      expect.any(String),
      "hu",
    );
    expect(result).toBe(5);
  });

  test("register throws 400 when email already exists", async () => {
    mockRepository.findByEmail.mockResolvedValue({ user_id: 1 } as any);

    await expect(
      service.register({ email: "existing@test.com" } as any),
    ).rejects.toMatchObject({
      status: 400,
    });

    expect(mockRepository.createUser).not.toHaveBeenCalled();
  });

  test("register propagates repository error", async () => {
    mockRepository.findByEmail.mockRejectedValue(
      new Error("Hiányzó kötelező mező(k)."),
    );

    await expect(
      service.register({ email: "test@test.com" } as any),
    ).rejects.toThrow("Hiányzó kötelező mező(k).");
  });

  test("editUser returns result on success", async () => {
    const mockResult = { affectedRows: 1 };

    mockRepository.editUser.mockResolvedValue(mockResult as any);

    const result = await service.editUser({ username: "Updated" } as any, 2, 1);

    expect(mockRepository.editUser).toHaveBeenCalledWith(
      2,
      { username: "Updated" },
      1,
    );
    expect(result).toEqual(mockResult);
  });

  test("editUser throws 400 when result is null", async () => {
    mockRepository.editUser.mockResolvedValue(null as any);

    await expect(
      service.editUser({ username: "Updated" } as any, 2, 1),
    ).rejects.toMatchObject({
      status: 400,
      message: "Nincs semmi változtatni való!",
    });
  });

  test("editUser propagates repository error", async () => {
    mockRepository.editUser.mockRejectedValue(
      new HttpException(403, "Nincs jogosultságod szerkeszteni!"),
    );

    await expect(
      service.editUser({ username: "Updated" } as any, 2, 5),
    ).rejects.toMatchObject({
      status: 403,
      message: "Nincs jogosultságod szerkeszteni!",
    });
  });
  test("getmoderators returns list for admin", async () => {
    const mockData = [{ user_id: 2, role: "moderator" }];

    mockRepository.getModerators.mockResolvedValue(mockData as any);

    const result = await service.getmoderators(1);

    expect(mockRepository.getModerators).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getmoderators throws 403 when not admin", async () => {
    await expect(service.getmoderators(2)).rejects.toMatchObject({
      status: 403,
      message: "Csak az admin kérheti le.",
    });

    expect(mockRepository.getModerators).not.toHaveBeenCalled();
  });

  test("getmoderators propagates repository error", async () => {
    mockRepository.getModerators.mockRejectedValue(new Error("DB hiba"));

    await expect(service.getmoderators(1)).rejects.toThrow("DB hiba");
  });

  test("deleteUser returns result for moderator", async () => {
    const mockResult = { affectedRows: 1 };

    mockRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.deletUser.mockResolvedValue(mockResult as any);

    const result = await service.deleteUser(2, 1);

    expect(mockRepository.getModerators).toHaveBeenCalled();
    expect(mockRepository.deletUser).toHaveBeenCalledWith(2);
    expect(result).toEqual(mockResult);
  });

  test("deleteUser throws 403 when not moderator", async () => {
    mockRepository.getModerators.mockResolvedValue([{ user_id: 99 }] as any);

    await expect(service.deleteUser(2, 1)).rejects.toMatchObject({
      status: 403,
      message: "Csak a moderátor kérheti le!",
    });

    expect(mockRepository.deletUser).not.toHaveBeenCalled();
  });

  test("deleteUser throws 404 when no rows affected", async () => {
    mockRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.deletUser.mockResolvedValue({ affectedRows: 0 } as any);

    await expect(service.deleteUser(99, 1)).rejects.toMatchObject({
      status: 404,
      message: "Az user nem található.",
    });
  });

  test("deleteUser propagates repository error", async () => {
    mockRepository.getModerators.mockResolvedValue([{ user_id: 1 }] as any);
    mockRepository.deletUser.mockRejectedValue(new Error("DB hiba"));

    await expect(service.deleteUser(2, 1)).rejects.toThrow("DB hiba");
  });
});
