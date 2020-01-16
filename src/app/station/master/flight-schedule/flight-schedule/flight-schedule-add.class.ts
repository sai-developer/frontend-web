import {Log} from '../../tasks/task/log.class';

export class AddFlight extends Log {
        id: Number;
        depFlightNumber: String;
        arrFlightNumber: String;
        frequency: Number;
        flightType: Number;
        standardArrivalTime: any;
        standardDepartureTime: any;
        origin: Station;
        station: Number;
        destination: Station;
        effectiveFrom: any;
        effectiveTo: any;
        equipmentTypeId: Eqp;
        flightStatus: Number;
        flightFrequencyModified:any;
        freqModified:any;
    constructor(addFlight: any = {}){
      addFlight = addFlight || addFlight !== null ? addFlight : {};
      super(addFlight.active, addFlight.createdBy, addFlight.createdAt, addFlight.modifiedBy, addFlight.modifiedAt);    
     this.id = addFlight.id || '';
     this.depFlightNumber= addFlight.depFlightNumber || '';
     this.arrFlightNumber= addFlight.arrFlightNumber || '';
     this.frequency= addFlight.frequency || 127 ;
     this.flightType= addFlight.flightType || null ;
     this.standardArrivalTime= addFlight.standardArrivalTime || '';
     this.standardDepartureTime= addFlight.standardDepartureTime || '';
     this.origin= new Station(addFlight.origin || '');
     this.station= addFlight.station || '';
     this.destination = new Station(addFlight.destination || '');
     this.effectiveFrom= addFlight.effectiveFrom || '';
     this.effectiveTo= addFlight.effectiveTo || '';
     this.equipmentTypeId= new Eqp(addFlight.equipmentTypeId || '');
     this.flightStatus= addFlight.flightStatus || '';
     this.flightFrequencyModified = addFlight.flightFrequencyModified || '';
     this.freqModified = addFlight.freqModified || '';
    }
   
  }

  export class Station {
    id : Number;
    constructor(station:any = {}){
      station = station || station !== null ? station : {};
      this.id = station.id;
    }
  }

  export class Eqp {
    id : Number;
    constructor(eqp:any = {}){
      eqp = eqp || eqp !== null ? eqp : {};
      this.id = eqp.id;
    }
  }
  