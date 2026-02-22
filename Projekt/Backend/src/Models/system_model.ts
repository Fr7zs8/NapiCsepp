export interface ISystemStatistic {
  total_users: number;
  total_activity_today: number;
  total_activity: number;
  total_habits: number;
}

export interface IProfileStats {
  total_activity: number;
  completed: number;
  daily_tasks_count: number;
  monthly_events_count: number;
  hard_tasks: number;
  middle_tasks: number;
  easy_tasks: number;
  weekly_tasks: number;
  weekly_tasks_completed: number;
}
