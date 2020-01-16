export class Log {
    active: string;
    createdBy: number;
    createdAt: any;
    modifiedBy: number;
    modifiedAt: any;
    constructor(active: string, createdBy: number, createdAt: number, modifiedBy: number, modifiedAt: number) {
        this.active = active || 'Y';
        this.createdBy = createdBy || parseInt(localStorage.getItem('userId'));
        this.createdAt=  createdAt || parseInt(localStorage.getItem('currentTime'));
        this.modifiedBy = modifiedBy || parseInt(localStorage.getItem('userId'));
        this.modifiedAt = modifiedAt || parseInt(localStorage.getItem('currentTime'));
    }
}