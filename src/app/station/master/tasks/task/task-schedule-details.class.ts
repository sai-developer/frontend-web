import { Task } from "./task-master.class";
import { TaskScheduleMaster } from './task-schedule-master.class';
import { Log } from './log.class';
export class TaskScheduleDetails extends Log {
  id: number;
  activityStart: any;
  arrDepType: number;
  duration: number;
  taskSequenceNumber: number;
  taskDependencyMasterList: null;
  taskDependencyMasterList1: null;
  resourceMappingList: null;
  dependency : any;
  taskId: Task;
  taskScheduleId: TaskScheduleMaster;
  optional: number;
  constructor(task: any = {}) {
    super(task.active, task.createdBy, task.createdAt, task.modifiedBy, task.modifiedAt);
    this.id = task.id || 0;
    this.activityStart = task.activityStart || 0;
    if(task.activityStart >0 && task.activityStart <10){
      this.activityStart =  "0"+task.activityStart;
    }
    this.arrDepType = task.arrDepType;
    this.duration = task.duration || 0;
    this.taskSequenceNumber = task.taskSequenceNumber || 1;
    this.optional = task.optional || 0;
    this.taskDependencyMasterList = task.taskDependencyMasterList || null;
    this.taskDependencyMasterList1 = task.taskDependencyMasterList1 || null;
    this.resourceMappingList = task.resourceMappingList;
    this.taskId = new Task(task.taskId);
    this.taskScheduleId = new TaskScheduleMaster(task.taskScheduleId);
  }
  static set(iTaskInfos: any[]): TaskScheduleDetails[] {
    let taskInfos: TaskScheduleDetails[] = [];
    for (let i = 0; i < iTaskInfos.length; i++) {
      taskInfos.push(new TaskScheduleDetails(iTaskInfos[i]));
    }
    return taskInfos;

  }
}
