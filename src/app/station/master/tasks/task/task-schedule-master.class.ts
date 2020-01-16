import { TypeMaster } from './aircraft-master.class';
import {Log} from './log.class';

export class TaskScheduleMaster extends Log{
    id: number;
    flightType: number;
    bayType: number;
    flightSchedulesList: null;
    taskScheduleDetailsList: null;
    equipmentTypeId: TypeMaster;
 
    constructor(taskScheduleId: any = {}) {
        taskScheduleId = taskScheduleId || taskScheduleId !== null ? taskScheduleId : {}; 
        super(taskScheduleId.active, taskScheduleId.createdBy, taskScheduleId.createdAt, taskScheduleId.modifiedBy, taskScheduleId.modifiedAt);    
        this.id = taskScheduleId.id || 0;
        this.flightType = taskScheduleId.flightType || 0;
        this.bayType = taskScheduleId.bayType || 0;
        this.flightSchedulesList = taskScheduleId.flightSchedulesList || null;
        this.taskScheduleDetailsList = taskScheduleId.taskScheduleDetailsList || null;
        this.equipmentTypeId = new TypeMaster(taskScheduleId.equipmentTypeId);
    }

    setTaskScheduleIds(iTaskScheduleIds: any[]): TaskScheduleMaster[] {
        let taskScheduleIds: TaskScheduleMaster[] = [];
        for (let i = 0; i < iTaskScheduleIds.length; i++) {
            taskScheduleIds.push(new TaskScheduleMaster(iTaskScheduleIds[i]));
        }
        return taskScheduleIds;

    }
}