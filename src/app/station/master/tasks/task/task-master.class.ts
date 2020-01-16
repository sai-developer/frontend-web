import { Activity } from "./activity-master.class";
import {Log} from './log.class';

export class Task extends Log{
  id:any;
  name: string;
  activityId: Activity;
  taskScheduleDetailsList: null;

  constructor(task: any = {}) {
    super(task.active, task.createdBy, task.createdAt, task.modifiedBy, task.modifiedAt);    
    this.id = task.id;
    this.name = task.name || '';   
    this.activityId = new Activity(task.activityId);
    this.taskScheduleDetailsList = task.taskScheduleDetailsList || null;

  }
   static setTasks(iTasks: any[]): Task[] {
      let tasks: Task[] = [];
      for (let i = 0; i < iTasks.length; i++) {
        tasks.push(new Task(iTasks[i]));
      }
      return tasks;

    }

 
}

