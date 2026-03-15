import { EventRepository } from "../../src/Repositories/event_repository";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise");

describe("EventRepository", () => {
  let repository: EventRepository;
  let mockConnection: any;

  beforeEach(() => {
    repository = new EventRepository();

    mockConnection = {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  test("getEvent returns list of events", async () => {
    const mockData = [
      { event_id: 1, event_name: "Futóverseny" },
      { event_id: 2, event_name: "Úszóverseny" },
    ];

    mockConnection.query.mockResolvedValue([[mockData]]);

    const result = await repository.getEvent(1);

    expect(mysql.createConnection).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.query).toHaveBeenCalledWith(
      "CALL pr_pullevent(?)",
      [1],
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test("getEvent returns empty array when no data", async () => {
    mockConnection.query.mockResolvedValue([[[]]]);

    const result = await repository.getEvent(1);

    expect(result).toEqual([]);
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("getEvent throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.getEvent(1)).rejects.toThrow("DB hiba");
  });

  test("insertEvent returns insertId", async () => {
    const mockEvent = {
      event_name: "Futóverseny",
      event_start_time: "2024-01-01",
      event_end_time: "2024-01-02",
    };

    mockConnection.query.mockResolvedValue([{ insertId: 5 }]);

    const result = await repository.insertEvent(
      mockConnection,
      mockEvent as any,
      2,
    );

    expect(mockConnection.query).toHaveBeenCalledWith(
      "INSERT INTO events (event_name, event_start_time, event_end_time) VALUES (?, ?, ?)",
      [
        mockEvent.event_name,
        mockEvent.event_start_time,
        mockEvent.event_end_time,
      ],
    );
    expect(result).toBe(5);
  });

  test("postEvent commits transaction and returns eventId", async () => {
    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([{}]);

    const mockEvent = {
      event_name: "Futóverseny",
      event_start_time: "2024-01-01",
      event_end_time: "2024-01-02",
    };

    const result = await repository.postEvent(mockEvent as any, 1);

    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(mockConnection.rollback).not.toHaveBeenCalled();
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toBe(10);
  });

  test("postEvent rollbacks transaction on error", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    const mockEvent = {
      event_name: "Futóverseny",
      event_start_time: "2024-01-01",
      event_end_time: "2024-01-02",
    };

    await expect(repository.postEvent(mockEvent as any, 1)).rejects.toThrow(
      "DB hiba",
    );

    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
    expect(mockConnection.end).toHaveBeenCalled();
  });

  test("deleteEvent returns result", async () => {
    const mockResult = { affectedRows: 1 };

    mockConnection.query.mockResolvedValue([mockResult]);

    const result = await repository.deleteEvent(1);

    expect(mockConnection.query).toHaveBeenCalledWith(
      "DELETE FROM events WHERE event_id = ?",
      [1],
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  test("deleteEvent throws error on query failure", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(repository.deleteEvent(1)).rejects.toThrow("DB hiba");
  });

  test("updateEvent returns result with valid fields", async () => {
    const mockResult = { affectedRows: 1 };

    mockConnection.query.mockResolvedValue([mockResult]);

    const result = await repository.updateEvent(1, { event_name: "Új név" }, 2);

    expect(mockConnection.query).toHaveBeenCalledWith(
      "UPDATE events SET event_name = ? WHERE event_id = ?",
      ["Új név", 1],
    );
    expect(mockConnection.end).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  test("updateEvent filters out invalid fields", async () => {
    const mockResult = { affectedRows: 1 };

    mockConnection.query.mockResolvedValue([mockResult]);

    await repository.updateEvent(
      1,
      {
        event_name: "Új név",
        invalid_field: "érték",
      } as any,
      2,
    );

    const callArgs = mockConnection.query.mock.calls[0];
    expect(callArgs[0]).not.toContain("invalid_field");
    expect(callArgs[0]).toContain("event_name");
  });

  test("updateEvent closes connection on error", async () => {
    mockConnection.query.mockRejectedValue(new Error("DB hiba"));

    await expect(
      repository.updateEvent(1, { event_name: "Új név" }, 2),
    ).rejects.toThrow("DB hiba");

    expect(mockConnection.end).toHaveBeenCalled();
  });
});
