import { Response } from "express";
import mysql from "mysql2/promise";
import config from "../src2/config/config";

export async function systemStatistic(_req: any, res: Response) {
  const connect = await mysql.createConnection(config.database);

  try {
    const stats = [];

    const [total_users] = (await connect.query(
      "SELECT COUNT(users.user_id) AS total_users FROM users",
    )) as Array<any>;

    const [total_activity_today] = (await connect.query(
      "SELECT COUNT(activities.activity_id) AS total_activity_today FROM activities WHERE DATE(activities.activity_start_date) = CURDATE();",
    )) as Array<any>;

    const [total_activity] = (await connect.query(
      "SELECT COUNT(activities.activity_id) AS total_activity FROM activities",
    )) as Array<any>;

    const [total_habits] = (await connect.query(
      'SELECT COUNT(activities.activity_id) AS total_habits FROM activities JOIN types ON activities.activity_type_id = types.type_id WHERE types.type_name = "szokás"',
    )) as Array<any>;

    stats.push({
      total_users: total_users[0].total_users,
      total_activity_today: total_activity_today[0].total_activity_today,
      total_activity: total_activity[0].total_activity,
      total_habits: total_habits[0].total_habits,
    });

    res.status(200).send(stats);
  } catch (e) {
    console.log(e);
  }
}

export async function profileStatistic(req: any, res: Response) {
  //Átírni hogy ne legyen ennyi string
  const id = req.user.user_id;

  const connect = await mysql.createConnection(config.database);
  try {
    const stats = [];

    const [total_activity] = (await connect.query(
      "SELECT COUNT(activities.activity_id) AS total_activity FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE users.user_id = ?",
      [id],
    )) as Array<any>;

    const [completed] = (await connect.query(
      "SELECT COUNT(activities.activity_id) AS completed FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE users.user_id = ? AND activities.activity_achive = 1 ",
      [id],
    )) as Array<any>;

    const [daily_tasks_count] = (await connect.query(
      "SELECT COUNT(activities.activity_id) AS daily_tasks_count FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE activities.activity_start_date = CURRENT_DATE() AND users.user_id = ?",
      [id],
    )) as Array<any>;

    const [monthly_events_count] = (await connect.query(
      "SELECT COUNT(events.event_id) AS monthly_events_count FROM events JOIN users_events ON users_events.event_id = events.event_id JOIN users ON users_events.user_id = users.user_id WHERE MONTH(events.event_start_time) = MONTH(CURDATE()) AND users.user_id = ?",
      [id],
    )) as Array<any>;

    const [hard_tasks] = (await connect.query(
      'SELECT COUNT(activities.activity_id) AS hard FROM activities JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE difficulties.difficulty_name = "Nehéz" AND users.user_id = ?',
      [id],
    )) as Array<any>;

    const [middle_tasks] = (await connect.query(
      'SELECT COUNT(activities.activity_id) AS middle FROM activities JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE difficulties.difficulty_name = "Közepes" AND users.user_id = ?',
      [id],
    )) as Array<any>;

    const [easy_tasks] = (await connect.query(
      'SELECT COUNT(activities.activity_id) AS easy FROM activities JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE difficulties.difficulty_name = "Könnyű" AND users.user_id = ?',
      [id],
    )) as Array<any>;

    const [weekly_tasks] = (await connect.query(
      "SELECT COUNT(*) AS weekly_task FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE YEARWEEK(activities.activity_start_date, 1) = YEARWEEK(CURDATE(), 1) AND users.user_id = ?",
      [id],
    )) as Array<any>;

    const [weekly_tasks_completed] = (await connect.query(
      "SELECT COUNT(*) AS weekly_task_complete FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users_activities.user_id = users.user_id WHERE YEARWEEK(activities.activity_start_date, 1) = YEARWEEK(CURDATE(), 1) AND activities.activity_achive = 1 AND users.user_id = ?",
      [id],
    )) as Array<any>;

    stats.push({
      total_activity: total_activity[0].total_activity || 0,
      completed: completed[0].completed || 0,
      daily_tasks_count: daily_tasks_count[0].daily_tasks_count || 0,
      monthly_events_count: monthly_events_count[0].monthly_events_count || 0,
      hard_tasks: hard_tasks[0].hard || 0,
      middle_tasks: middle_tasks[0].middle || 0,
      easy_tasks: easy_tasks[0].easy || 0,
      weekly_tasks: weekly_tasks[0].weekly_task || 0,
      weekly_tasks_completed:
        weekly_tasks_completed[0].weekly_task_complete || 0,
    });
    res.status(200).send(stats);
  } catch (e) {
    console.log(e);
  }
}
