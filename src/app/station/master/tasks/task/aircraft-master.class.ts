import { Log } from './log.class';
export class TypeMaster extends Log {
    id: number;
    type: string;
    description: string;   
    equipmentMasterList: null;
    flightSchedulesList: null;
    taskScheduleMasterList: null;
    constructor(master: any = {}) {
        master = master || master !== null ? master : {};
        super(master.active, master.createdBy, master.createdAt, master.modifiedBy, master.modifiedAt);
        this.id = master.id;
        this.type = master.type || '';
        this.description = master.description || '';
        this.equipmentMasterList = master.equipmentMasterList || null;
        this.flightSchedulesList = master.flightSchedulesList || null;
        this.taskScheduleMasterList = master.taskScheduleMasterList || null;
    }
}
export class AirCraft  extends Log {
    id: number;
    tailNumber: string;   
    typeId: TypeMaster;
    flightSchedulesList: null;
     constructor(master: any = {}) {
        master = master || master !== null ? master : {};
        super(master.active, master.createdBy, master.createdAt, master.modifiedBy, master.modifiedAt);        
        this.id = master.id || 0;
        this.tailNumber = master.tailNumber || '';   
        this.typeId = new TypeMaster(master.typeId);
        this.flightSchedulesList = master.flightSchedulesList || null;
    }
    static set(iAirCrafts: any[]): AirCraft[] {
        let aircrafts: AirCraft[] = [];
        for (let i = 0; i < iAirCrafts.length; i++) {
            aircrafts.push(new AirCraft(iAirCrafts[i]));
        }
        return aircrafts;
    }
};
export class EquipmentList  extends Log {
    public id: number;
    public type: string;
    public description: string;
    public oem: string;
    public category: string;
    public defaultBayType: string;
    constructor(EquipmentList: any) {
        EquipmentList = EquipmentList || EquipmentList !== null ? EquipmentList : {};
        super(EquipmentList.active, EquipmentList.createdBy, EquipmentList.createdAt, EquipmentList.modifiedBy, EquipmentList.modifiedAt);        
        this.id = EquipmentList.id;
        this.type = EquipmentList.type;
        this.description = EquipmentList.description;
        this.oem = EquipmentList.oem;
        this.category = EquipmentList.category;
        this.defaultBayType = EquipmentList.defaultBayType;
    }
    set(iEquipmentList: any[]): EquipmentList[] {
        let equipments: EquipmentList[] = [];
        for (let i = 0; i < iEquipmentList.length; i++) {
            equipments.push(new EquipmentList(iEquipmentList[i]));
        }
        return equipments;
    }
}