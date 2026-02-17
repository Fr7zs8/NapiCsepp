export interface IActivity {
  activity_id: number;
  activity_name: string;
  activity_type_name: string;
  activity_difficulty_name: string;
  activity_achive: boolean;
  activity_start_date: Date;
  activity_end_date: Date;
  progress_counter: Number
}

export class Activity implements IActivity {
  activity_id: number;
  activity_name: string;
  activity_type_name: string;
  activity_difficulty_name: string;
  activity_achive: boolean;
  activity_start_date: Date;
  activity_end_date: Date;
  progress_counter: Number;

  constructor(init: IActivity) {
    ((this.activity_id = init.activity_id),
      (this.activity_name = init.activity_name),
      (this.activity_type_name = init.activity_type_name),
      (this.activity_difficulty_name = init.activity_difficulty_name),
      (this.activity_achive = init.activity_achive),
      (this.activity_start_date = init.activity_start_date),
      (this.activity_end_date = init.activity_end_date),
      (this.progress_counter = init.progress_counter)
    );

  }
}
