import { Log } from './log.class';

export class Activity extends Log  {
  id: number;
  name: string;
  description:string;  
  taskMasterList:null;
  constructor(task: any = {}) {
    super(task.active,task.createdBy,task.createdAt,task.modifiedBy,task.modifiedAt);
    this.id = task.id || 0;
    this.name = task.name || '';
    this.description = task.description || '';
    this.taskMasterList = task.taskMasterList || null;
  }
}
