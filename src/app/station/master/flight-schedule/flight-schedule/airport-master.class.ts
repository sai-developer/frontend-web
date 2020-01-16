import {Log} from '../../tasks/task/log.class';

export class Airport extends Log {
  id: number;
  code: string;
  name: string ;
  city: string ;
  state: string ;
  country: string ;
  region: string ;
  lat: number ;
  lng: number ; 
  bayMasterList:null;
  flightScheduleDetailsList:null;
  flightScheduleDetailsList1:null;
  flightScheduleDetailsList2:null;
  flightSchedulesList:null;
  flightSchedulesList1:null;
  flightSchedulesList2:null;
  userAirportMappingList:null;
  
  constructor(airport: any = {}){
    airport = airport || airport !== null ? airport : {};
    super(airport.active, airport.createdBy, airport.createdAt, airport.modifiedBy, airport.modifiedAt);    
    this.id = airport.id || '';
    this.code = airport.code || '';
    this.name = airport.name || '';
    this.city = airport.city || '';
    this.state = airport.state || '';
    this.country = airport.country || '';
    this.region = airport.region || '';
    this.lat = airport.lat || 0;
    this.lng = airport.lng || 0;  
    this.bayMasterList = airport.bayMasterList || null;
    this.flightScheduleDetailsList = airport.flightScheduleDetailsList || null;
    this.flightScheduleDetailsList1 = airport.flightScheduleDetailsList1 || null;
    this.flightScheduleDetailsList2 = airport.flightScheduleDetailsList2 || null;
    this.flightSchedulesList = airport.flightSchedulesList || null;
    this.flightSchedulesList1 = airport.flightSchedulesList1 || null;
    this.flightSchedulesList2 = airport.flightSchedulesList2 || null;
    this.userAirportMappingList = airport.userAirportMappingList || null;
  }
  static setAirports(iAirports: any[]) :Airport[]{
    let airports: Airport[] = [];
    for (let i = 0; i < iAirports.length; i++) {
      airports.push(new Airport(iAirports[i]));
    }
    return airports;
  }
}
