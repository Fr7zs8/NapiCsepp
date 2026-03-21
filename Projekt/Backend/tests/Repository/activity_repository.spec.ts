/// <reference types="jest" />

import { ActivityRepository } from "../../src/Repositories/activity_repository";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("ActivityRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllActivitiesByUser returns activities", async () => {
    const mockActivity = {
      activity_id: 1,
      activity_name: "Levinni a szemetet",
      type_name: "Házimunka",
      difficulty_name: "Könnyű",
      activity_achive: 1,
      activity_start_date: "2025-11-10",
      activity_end_date: "2025-11-10",
      progress_counter: 0,
    };

    const mockQuery = jest.fn().mockResolvedValue([[[mockActivity]]]);

    const mockConnection = { query: mockQuery, end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const result = await repo.getAllActivitiesByUser(2);

    expect(mockQuery).toHaveBeenCalledWith("CALL pr_pullactivities(?)", [2]);
    expect(result).toEqual([mockActivity]);
  });

  test("getHabits returns habits", async () => {
    const mockHabit = {
      activity_id: 1,
      activity_name: "Habit1",
      type_name: "Szokás",
      difficulty_name: "Könnyű",
      activity_achive: 0,
      activity_start_date: "2025-01-01",
      activity_end_date: "2025-01-02",
      progress_counter: 0,
    };

    const mockQuery = jest.fn().mockResolvedValue([[[mockHabit]]]);

    const mockConnection = { query: mockQuery, end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const result = await repo.getHabits(1);

    expect(mockQuery).toHaveBeenCalledWith("CALL pr_pullhabits(?)", [1]);
    expect(result).toEqual([mockHabit]);
  });

  test("deleteActivity deletes activity", async () => {
    const mockQuery = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);

    const mockConnection = { query: mockQuery, end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const result = await repo.deleteActivity(5);

    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM activities WHERE activity_id = ?",
      [5],
    );
    expect(result).toEqual({ affectedRows: 1 });
  });

  test("postActivity inserts activity and links user", async () => {
    const mockConnection = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ type_id: 1 }]])
        .mockResolvedValueOnce([[{ difficulty_id: 1 }]])
        .mockResolvedValueOnce([{ insertId: 99 }])
        .mockResolvedValueOnce([{}]),

      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const newelem = {
      activity_name: "New",
      activity_type_name: "Type",
      activity_difficulty_name: "Easy",
      activity_achive: 0,
      activity_start_date: "2025-01-01",
      activity_end_date: "2025-01-02",
      progress_counter: 0,
    } as any;

    const result = await repo.postActivity(newelem, 1);

    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(result).toBe(99);
  });

  test("postActivity rollbacks on error", async () => {
    const mockConnection = {
      query: jest.fn().mockRejectedValue(new Error("DB hiba")),
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const newelem = {
      activity_name: "Test",
      activity_type_name: "Type",
      activity_difficulty_name: "Easy",
      activity_achive: 0,
      activity_start_date: "2025-01-01",
      activity_end_date: "2025-01-02",
      progress_counter: 0,
    } as any;

    await expect(repo.postActivity(newelem, 1)).rejects.toThrow("DB hiba");
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("getTypeId throws 404 when type not found", async () => {
    const mockConnection = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ difficulty_id: 1 }]])
        .mockResolvedValueOnce([{ insertId: 1 }]),
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const newelem = {
      activity_name: "Test",
      activity_type_name: "NemLétezőTípus",
      activity_difficulty_name: "Easy",
      activity_achive: 0,
      activity_start_date: "2025-01-01",
      activity_end_date: "2025-01-02",
      progress_counter: 0,
    } as any;

    await expect(repo.postActivity(newelem, 1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs ilyen típus",
    });

    expect(mockConnection.rollback).toHaveBeenCalled();
  });

  test("getDifficultyId throws 404 when difficulty not found", async () => {
    const mockConnection = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ type_id: 1 }]])
        .mockResolvedValueOnce([[]]),
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const newelem = {
      activity_name: "Test",
      activity_type_name: "Type",
      activity_difficulty_name: "NemLétezőNehézség",
      activity_achive: 0,
      activity_start_date: "2025-01-01",
      activity_end_date: "2025-01-02",
      progress_counter: 0,
    } as any;

    await expect(repo.postActivity(newelem, 1)).rejects.toMatchObject({
      status: 404,
      message: "Nincs ilyen nehézség",
    });

    expect(mockConnection.rollback).toHaveBeenCalled();
  });

  test("putActivity throws 404 when activity is empty", async () => {
    const mockConnection = { query: jest.fn(), end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();

    await expect(repo.putActivity(1, {}, 2)).rejects.toMatchObject({
      status: 404,
      message: "Nincs frissítendő adat!",
    });
  });

  test("putActivity updates all fields including type and difficulty", async () => {
    const mockQuery = jest
      .fn()
      .mockResolvedValueOnce([[{ type_id: 2 }]])
      .mockResolvedValueOnce([[{ difficulty_id: 3 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const mockConnection = { query: mockQuery, end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const result = await repo.putActivity(
      1,
      {
        activity_type_name: "Új típus",
        activity_difficulty_name: "Nehéz",
        activity_name: "Új név",
        activity_achive: 1,
        activity_start_date: "2025-01-01",
        activity_end_date: "2025-01-02",
        progress_counter: 5,
      } as any,
      2,
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test("putActivity throws 404 when affectedRows is 0", async () => {
    const mockQuery = jest.fn().mockResolvedValue([{ affectedRows: 0 }]);

    const mockConnection = { query: mockQuery, end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();

    await expect(
      repo.putActivity(1, { activity_name: "Teszt" }, 2),
    ).rejects.toMatchObject({
      status: 404,
      message: "Nincs ilyen activity!",
    });
  });

  test("putActivity throws 404 when no valid fields provided", async () => {
    const mockConnection = { query: jest.fn(), end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();

    await expect(
      repo.putActivity(1, { nemLetezőMező: "érték" } as any, 2),
    ).rejects.toMatchObject({
      status: 404,
      message: "Nincs frissítendő mező!",
    });
  });

  test("putActivity updates fields", async () => {
    const mockQuery = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);

    const mockConnection = { query: mockQuery, end: jest.fn() };
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    const repo = new ActivityRepository();
    const result = await repo.putActivity(1, { activity_name: "Updated" }, 2);

    expect(mockConnection.query).toHaveBeenCalled();
    expect(result).toEqual({ affectedRows: 1 });
  });
});
