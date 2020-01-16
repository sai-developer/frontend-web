export class DelayTask {

        task_id: number;
        task_name: string ;
        delay_code_id: number;
        delay_code_description:string;
        delay_numeric_code: any;
        delay_alphabetic_code: string;
        is_default: number;
        
        constructor(delayTask: any = {}) {
            delayTask = delayTask || delayTask !== null ? delayTask : {};
            // super(delay.active, delay.createdBy, delay.createdAt, delay.modifiedBy, delay.modifiedAt);   
            this.task_id = delayTask.task_id;
            this.task_name = delayTask.task_name
            this.delay_code_id= delayTask.delay_code_id
            this.delay_code_description= delayTask.delay_code_description
            this.delay_numeric_code=delayTask.delay_numeric_code;
        this.delay_alphabetic_code= delayTask.delay_alphabetic_code;
            this.is_default= delayTask.is_default;
        }
            static set(iDelayTaskInfo: any[]): DelayTask[] {
                let delayTaskInfo: DelayTask[] = [];
                for (let i = 0; i < iDelayTaskInfo.length; i++) {
                  delayTaskInfo.push(new DelayTask(iDelayTaskInfo[i]));
                }
                return delayTaskInfo;
            
              }
            }