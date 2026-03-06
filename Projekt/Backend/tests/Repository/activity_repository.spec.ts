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
