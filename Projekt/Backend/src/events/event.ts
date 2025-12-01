export interface IEvent{
    event_id: number
    event_name: string
    event_start_time: Date
    event_end_time: Date
}

export class Event implements IEvent{
    event_id: number
    event_name: string
    event_start_time: Date
    event_end_time: Date

    constructor(init:IEvent){
        this.event_id = init.event_id
        this.event_name = init.event_name
        this.event_start_time = init.event_start_time
        this.event_end_time = init.event_end_time
    }
}