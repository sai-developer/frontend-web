import {Log} from '../../../../common-class/log-class';

export class Delays extends Log{

        id: number;
        delay_numeric_code: number;
        delay_alphabetic_code:string;
        description: string;
        delay_category_id: any;
        
        constructor(delay: any = {}) {
            delay = delay || delay !== null ? delay : {};
            super(delay.active, delay.createdBy, delay.createdAt, delay.modifiedBy, delay.modifiedAt);   
            this.id = delay.id;
            this.delay_numeric_code = delay.delay_numeric_code
            this.delay_alphabetic_code = delay.delay_alphabetic_code
            // this.delayAlphabeticCode= delay.delayAlphabeticCode
            this.description= delay.description
            this.delay_category_id= delay.delay_category_id;
        }
            static set(iDelayInfo: any[]): Delays[] {
                let delayInfos: Delays[] = [];
                for (let i = 0; i < iDelayInfo.length; i++) {
                  delayInfos.push(new Delays(iDelayInfo[i]));
                }
                return delayInfos;
            
              }
            }
