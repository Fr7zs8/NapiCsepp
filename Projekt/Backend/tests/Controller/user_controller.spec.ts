import { UserController } from "../../src/Controllers/user_controller";
import { UserService } from "../../src/Services/user_service";

jest.mock("../../src/Services/user_service");

describe("UserController", () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockService = new UserService() as jest.Mocked<UserService>;
    controller = new UserController();

    // @ts-ignore
    controller.service = mockService;

    req = {
      user: { user_id: 1 },
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("login returns 200 and token on success", async () => {
    mockService.login.mockResolvedValue("mock_token");

    req.body = { email: "test@test.com", password: "password" };

    await controller.login(req, res);

    expect(mockService.login).toHaveBeenCalledWith("test@test.com", "password");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ token: "mock_token" });
  });

  test("login returns 400 when email or password missing", async () => {
    req.body = { email: "test@test.com" };

    await controller.login(req, res);

    expect(mockService.login).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Nem megfelelők az adatok.",
    });
  });

  test("login returns 400 when body is empty", async () => {
    req.body = {};

    await controller.login(req, res);

    expect(mockService.login).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login handles 401 error", async () => {
    mockService.login.mockRejectedValue({
      status: 401,
      message: "Rossz az email vagy a jelszó",
    });

    req.body = { email: "test@test.com", password: "wrongpassword" };

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      message: "Rossz az email vagy a jelszó",
    });
  });

  test("login handles 500 error without status", async () => {
    mockService.login.mockRejectedValue(new Error("Ismeretlen hiba"));

    req.body = { email: "test@test.com", password: "password" };

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("login returns default message when error has no message", async () => {
    mockService.login.mockRejectedValue({ status: 503 });

    req.body = { email: "test@test.com", password: "password" };

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("login returns 500 and default message when error is empty object", async () => {
    mockService.login.mockRejectedValue({});

    req.body = { email: "test@test.com", password: "password" };

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });
  test("getUser returns 200 and user data", async () => {
    const mockUser = {
      user_id: 1,
      username: "TestUser",
      email: "test@test.com",
    };

    mockService.getUser.mockResolvedValue(mockUser as any);

    await controller.getUser(req, res);

    expect(mockService.getUser).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockUser);
  });

  test("getUser handles 404 error", async () => {
    mockService.getUser.mockRejectedValue({
      status: 404,
      message: "Nincs egy db user ezzel a névvel.",
    });

    await controller.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs egy db user ezzel a névvel.",
    });
  });

  test("getUser handles 500 error without status", async () => {
    mockService.getUser.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("getUser returns 500 and default message when error is empty object", async () => {
    mockService.getUser.mockRejectedValue({});

    await controller.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("getAllUser returns 200 and list of users", async () => {
    const mockUsers = [
      { user_id: 1, username: "User1" },
      { user_id: 2, username: "User2" },
    ];

    mockService.getAllUser.mockResolvedValue(mockUsers as any);

    await controller.getAllUser(req, res);

    expect(mockService.getAllUser).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockUsers);
  });

  test("getAllUser handles 403 error", async () => {
    mockService.getAllUser.mockRejectedValue({
      status: 403,
      message: "Csak a moderátor kérheti le!",
    });

    await controller.getAllUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: "Csak a moderátor kérheti le!",
    });
  });

  test("getAllUser handles 500 error without status", async () => {
    mockService.getAllUser.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.getAllUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("getAllUser returns 500 and default message when error is empty object", async () => {
    mockService.getAllUser.mockRejectedValue({});

    await controller.getAllUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("register returns 201 on success", async () => {
    mockService.register.mockResolvedValue(5);

    req.body = {
      username: "NewUser",
      email: "new@test.com",
      password: "password",
      language: "hu",
    };

    await controller.register(req, res);

    expect(mockService.register).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Sikeres adatrögzítés!");
  });

  test("register handles 409 error", async () => {
    mockService.register.mockRejectedValue({
      status: 409,
      message: "Az email cím már használatban van",
    });

    req.body = { email: "existing@test.com", password: "password" };

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      message: "Az email cím már használatban van",
    });
  });

  test("register handles 500 error without status", async () => {
    mockService.register.mockRejectedValue(new Error("Ismeretlen hiba"));

    req.body = { email: "test@test.com", password: "password" };

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("register returns 500 and default message when error is empty object", async () => {
    mockService.register.mockRejectedValue({});

    req.body = { email: "test@test.com", password: "password" };

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("register returns 400 if no body", async () => {
    req.body = null;

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Érvénytelen bemeneti adatok.");
    expect(mockService.register).not.toHaveBeenCalled();
  });

  test("putUser returns 200 on success", async () => {
    mockService.editUser.mockResolvedValue({ affectedRows: 1 } as any);

    req.params.id = "2";
    req.body = { username: "UpdatedUser" };

    await controller.putUser(req, res);

    expect(mockService.editUser).toHaveBeenCalledWith(
      { username: "UpdatedUser" },
      "2",
      1,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Sikeres modositás!");
  });

  test("putUser handles 403 error", async () => {
    mockService.editUser.mockRejectedValue({
      status: 403,
      message: "Nincs jogosultságod szerkeszteni!",
    });

    req.params.id = "2";
    req.body = { username: "UpdatedUser" };

    await controller.putUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: "Nincs jogosultságod szerkeszteni!",
    });
  });

  test("putUser handles 404 error", async () => {
    mockService.editUser.mockRejectedValue({
      status: 404,
      message: "Nincs ilyen user!",
    });

    req.params.id = "99";

    await controller.putUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: "Nincs ilyen user!" });
  });

  test("putUser handles 500 error without status", async () => {
    mockService.editUser.mockRejectedValue(new Error("Ismeretlen hiba"));

    req.params.id = "2";

    await controller.putUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("putUser returns 500 and default message when error is empty object", async () => {
    mockService.editUser.mockRejectedValue({});

    req.params.id = "2";
    req.body = { username: "UpdatedUser" };

    await controller.putUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("getModerators returns 200 and list", async () => {
    const mockData = [{ user_id: 2, role: "moderator" }];

    mockService.getModerators.mockResolvedValue(mockData as any);

    await controller.getModerators(req, res);

    expect(mockService.getModerators).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  test("getModerators handles 403 error", async () => {
    mockService.getModerators.mockRejectedValue({
      status: 403,
      message: "Csak az admin kérheti le.",
    });

    await controller.getModerators(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: "Csak az admin kérheti le.",
    });
  });

  test("getModerators handles 500 error without status", async () => {
    mockService.getModerators.mockRejectedValue(new Error("Ismeretlen hiba"));

    await controller.getModerators(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("getModerators returns 500 and default message when error is empty object", async () => {
    mockService.getModerators.mockRejectedValue({});

    await controller.getModerators(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });

  test("deletUser returns 200 on success", async () => {
    mockService.deleteUser.mockResolvedValue({ affectedRows: 1 } as any);

    req.params.id = "2";

    await controller.deletUser(req, res);

    expect(mockService.deleteUser).toHaveBeenCalledWith("2", 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Sikeres törlés.");
  });

  test("deletUser handles 403 error", async () => {
    mockService.deleteUser.mockRejectedValue({
      status: 403,
      message: "Csak a moderátor kérheti le!",
    });

    req.params.id = "2";

    await controller.deletUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: "Csak a moderátor kérheti le!",
    });
  });

  test("deletUser handles 404 error", async () => {
    mockService.deleteUser.mockRejectedValue({
      status: 404,
      message: "Az user nem található.",
    });

    req.params.id = "99";

    await controller.deletUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Az user nem található.",
    });
  });

  test("deletUser handles 500 error without status", async () => {
    mockService.deleteUser.mockRejectedValue(new Error("Ismeretlen hiba"));

    req.params.id = "2";

    await controller.deletUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Ismeretlen hiba" });
  });

  test("deletUser returns 500 and default message when error is empty object", async () => {
    mockService.deleteUser.mockRejectedValue({});

    req.params.id = "2";

    await controller.deletUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Hiba történt a lekérés során.",
    });
  });
});
