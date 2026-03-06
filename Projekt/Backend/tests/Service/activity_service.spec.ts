import { ActivityService } from "../../src/Services/activity_service";
import { ActivityRepository } from "../../src/Repositories/activity_repository";
import { HttpException } from "../../src/middleware/error";

jest.mock("../../src/Repositories/activity_repository");

describe("ActivityService", () => {
  let service: ActivityService;
  let mockRepo: jest.Mocked<ActivityRepository>;

  beforeEach(() => {
    mockRepo = new ActivityRepository() as jest.Mocked<ActivityRepository>;
    service = new ActivityService();

    // service private, felülírjuk
    // @ts-ignore
    service.repository = mockRepo;
  });

  test("getAllActivities returns activities", async () => {
    mockRepo.getAllActivitiesByUser.mockResolvedValue([{ id: 1 }] as any);

    const result = await service.getAllActivities(5);

    expect(result).toEqual([{ id: 1 }]);
    expect(mockRepo.getAllActivitiesByUser).toHaveBeenCalledWith(5);
  });

  test("getAllActivities throws on invalid userId", async () => {
    await expect(service.getAllActivities(NaN)).rejects.toThrow(HttpException);
  });

  test("getHabits returns habits", async () => {
    mockRepo.getHabits.mockResolvedValue([{ id: 2 }] as any);

    const result = await service.getHabits(3);

    expect(result).toEqual([{ id: 2 }]);
    expect(mockRepo.getHabits).toHaveBeenCalledWith(3);
  });

  test("getHabits throws on invalid userId", async () => {
    await expect(service.getHabits(0)).rejects.toThrow(HttpException);
  });

  test("postActivity returns new activity ID", async () => {
    mockRepo.postActivity.mockResolvedValue(99);

    const newActivity = { activity_name: "Test" } as any;

    const result = await service.postActivity(newActivity, 1);

    expect(result).toBe(99);
    expect(mockRepo.postActivity).toHaveBeenCalledWith(newActivity, 1);
  });

  test("postActivity throws if userId invalid", async () => {
    await expect(service.postActivity({} as any, NaN)).rejects.toThrow(
      HttpException,
    );
  });

  test("postActivity throws if newelem missing", async () => {
    await expect(service.postActivity(null as any, 1)).rejects.toThrow(
      HttpException,
    );
  });

  test("postActivity throws if repository returns invalid ID", async () => {
    mockRepo.postActivity.mockResolvedValue(0);

    await expect(service.postActivity({} as any, 1)).rejects.toThrow(
      HttpException,
    );
  });

  test("deleteActivity returns result", async () => {
    mockRepo.deleteActivity.mockResolvedValue({ affectedRows: 1 } as any);

    const result = await service.deleteActivity(10);

    expect(result.affectedRows).toBe(1);
    expect(mockRepo.deleteActivity).toHaveBeenCalledWith(10);
  });

  test("deleteActivity throws if ID invalid", async () => {
    await expect(service.deleteActivity(NaN)).rejects.toThrow(HttpException);
  });

  test("deleteActivity throws if no rows affected", async () => {
    mockRepo.deleteActivity.mockResolvedValue({ affectedRows: 0 } as any);

    await expect(service.deleteActivity(5)).rejects.toThrow(HttpException);
  });

  test("putActivity updates and returns result", async () => {
    mockRepo.putActivity.mockResolvedValue({ affectedRows: 1 } as any);

    const result = await service.putActivity(1, { activity_name: "X" }, 2);

    expect(result.affectedRows).toBe(1);
    expect(mockRepo.putActivity).toHaveBeenCalledWith(
      1,
      { activity_name: "X" },
      2,
    );
  });

  test("putActivity throws if activityId invalid", async () => {
    await expect(
      service.putActivity(NaN, { activity_name: "X" }, 1),
    ).rejects.toThrow(HttpException);
  });

  test("putActivity throws if activity object empty", async () => {
    await expect(service.putActivity(1, {}, 1)).rejects.toThrow(HttpException);
  });

  test("putActivity throws if no rows affected", async () => {
    mockRepo.putActivity.mockResolvedValue({ affectedRows: 0 } as any);

    await expect(
      service.putActivity(1, { activity_name: "X" }, 1),
    ).rejects.toThrow(HttpException);
  });
});
