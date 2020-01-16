import * as momentzone from 'moment-timezone';
let zone = 'Europe/Dublin';
export class Log {
    active: string;
    createdBy: number;
    createdAt: any;
    modifiedBy: number;
    modifiedAt: any;
    constructor(active: string, createdBy: number, createdAt: number, modifiedBy: number, modifiedAt: number) {
        this.active = active || 'Y';
        this.createdBy = 1;
        this.createdAt=  momentzone().tz(zone).unix();
        this.modifiedBy = 1;
        this.modifiedAt = momentzone().tz(zone).unix();
    }
}