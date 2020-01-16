import { Airport } from './airport-master.class';
import { Log } from '../../tasks/task/log.class';
import { TypeMaster } from '../../tasks/task/aircraft-master.class';
// import { utils } from '../utilities/utils';
import * as moment from 'moment';
export class FlightScheduleDetails extends Log {
    id: number;
    origin: Airport;
    //station:Airport;
    station: any;
    destination: Airport;
    arrFlightNumber: string;
    standardArrivalTime: any;
    depFlightNumber: string;
    standardDepartureTime: any;
    frequency: number;
    flightType: number;
    effectiveFrom: number;
    effectiveTo: number;
    equipmentTypeId: TypeMaster;
    standardArrivalTimeSort :number;


    flightFrequencyModified: any;
    freqM
    flightStdModified: any;
    flightStaModified: any;
    flighteFromModified: any;
    flighteToModified: any;
    flighteFromDisplay: any;
    flighteToDisplay: any;
    viewdepFlightNumber: string;
    viewarrivalFlightNumber: string;
    flightTypeModified: any;
    flightStatus: any;
    length: any;
    freqModified:any
 
    constructor(flightScheduleDetails: any = {}) {
        flightScheduleDetails = flightScheduleDetails || flightScheduleDetails !== null ? flightScheduleDetails : {};
        super(flightScheduleDetails.active, flightScheduleDetails.createdBy, flightScheduleDetails.createdAt, flightScheduleDetails.modifiedBy, flightScheduleDetails.modifiedAt);
        this.length = flightScheduleDetails.length || 0;
        this.id = flightScheduleDetails.id || 0;
        this.depFlightNumber = flightScheduleDetails.depFlightNumber || '';
        this.arrFlightNumber = flightScheduleDetails.arrFlightNumber || '';
        this.frequency = flightScheduleDetails.frequency || '';
        this.flightType = flightScheduleDetails.flightType;
        this.standardArrivalTime = flightScheduleDetails.standardArrivalTime || '';
        this.standardDepartureTime = flightScheduleDetails.standardDepartureTime || '';
        this.origin = new Airport(flightScheduleDetails.origin);
        //this.station = new Airport(flightScheduleDetails.station);
        this.station = flightScheduleDetails.station;
        this.destination = new Airport(flightScheduleDetails.destination);
        this.effectiveFrom = flightScheduleDetails.effectiveFrom || 0;
        this.effectiveTo = flightScheduleDetails.effectiveTo || 0;
        this.equipmentTypeId = new TypeMaster(flightScheduleDetails.equipmentTypeId);
        this.standardArrivalTimeSort = flightScheduleDetails.standardArrivalTimeSort || 0;

        this.flightFrequencyModified = this.decodeFrequency(flightScheduleDetails.frequency) || 0;
        this.viewdepFlightNumber = flightScheduleDetails.depFlightNumber;
        this.viewarrivalFlightNumber = flightScheduleDetails.arrFlightNumber;
        this.freqModified = this.freqMod(flightScheduleDetails.frequency) || 0

        // this.flightStatus = this.fltStatus(flightScheduleDetails.effectiveFrom, flightScheduleDetails.effectiveTo);

    }
    static set(flightScheduleDetails: any[]): FlightScheduleDetails[] {
        let flightInfo: FlightScheduleDetails[] = [];
        for (let i = 0; i < flightScheduleDetails.length; i++) {
            flightInfo.push(new FlightScheduleDetails(flightScheduleDetails[i]))
        }
        return flightInfo;
    }
    decodeFrequency(frequency: any) {
        let freqInString = [
            // { id: 127, name: 'Daily', flag: '' },
            { id: 99, name: 'S', flag: false },
            { id: 98, name: 'M', flag: false },
            { id: 97, name: 'T', flag: false },
            { id: 96, name: 'W', flag: false },
            { id: 95, name: 'T', flag: false },
            { id: 94, name: 'F', flag: false },
            { id: 93, name: 'S', flag: false },
          ];
        if (frequency == 127) {
            freqInString = [
                { id: 99, name: 'S', flag: true },
                { id: 98, name: 'M', flag: true },
                { id: 97, name: 'T', flag: true },
                { id: 96, name: 'W', flag: true },
                { id: 95, name: 'T', flag: true },
                { id: 94, name: 'F', flag: true },
                { id: 93, name: 'S', flag: true },
              ];
        }
        else {
            if ((frequency & 1) > 0) {
                // freqInString.push( { id: 1, name: 'S', flag: false });
                freqInString[0] = { id: 99, name: 'S', flag: true }
            }
            if ((frequency & 2) > 0) {
                // freqInString.push( { id: 2, name: 'M', flag: false })
                freqInString[1] = { id: 98, name: 'M', flag: true }
            }
            if ((frequency & 4) > 0) {
                // freqInString.push( { id: 4, name: 'T', flag: false })
                freqInString[2] = { id: 97, name: 'T', flag: true }
            }
            if ((frequency & 8) > 0) {
                // freqInString.push( { id: 8, name: 'W', flag: false })
                freqInString[3] = { id: 96, name: 'W', flag: true }
            }
            if ((frequency & 16) > 0) {
                // freqInString.push( { id: 16, name: 'T', flag: false })
                freqInString[4] = { id: 95, name: 'T', flag: true }
            }
            if ((frequency & 32) > 0) {
                // freqInString.push( { id: 32, name: 'F', flag: false })
                freqInString[5] = { id: 94, name: 'F', flag: true }
            }
            if ((frequency & 64) > 0) {
                // freqInString.push( { id: 64, name: 'S', flag: false })
                freqInString[6] = { id: 93, name: 'S', flag: true }
            }
        }
        return freqInString;
    }

    // fltStatus(eFrom: any, eTo: any) {
    //     let serverTime = localStorage.getItem('currentTime');
    //     let timeNow
    //     if (serverTime != null) {
    //         timeNow = parseInt(localStorage.getItem('currentTime'));
    //     }
    //     else {
    //         let sysTime = new Date();
    //         timeNow = sysTime.getTime();
    //     }
    //     if (eFrom <= timeNow) {
    //         if (timeNow <= eTo) {
    //             return 0
    //             //flight is currently active
    //         }
    //         else {
    //             //flight is inactive
    //             return 1
    //         }
    //     }
    //     else {
    //         return 2
    //         //future flight
    //     }
    // }
      // Function to decode frequency for flight schedules
  freqMod(frequency: any) {
    let freqInString = [
        // { id: 127, name: 'Daily', flag: '' },
        { id: 1, name: 'S', flag: false },
        { id: 2, name: 'M', flag: false },
        { id: 4, name: 'T', flag: false },
        { id: 8, name: 'W', flag: false },
        { id: 16, name: 'T', flag: false },
        { id: 32, name: 'F', flag: false },
        { id: 64, name: 'S', flag: false },
      ];
    if (frequency == 127) {
        freqInString = [
            { id: 1, name: 'S', flag: true },
            { id: 2, name: 'M', flag: true },
            { id: 4, name: 'T', flag: true },
            { id: 8, name: 'W', flag: true },
            { id: 16, name: 'T', flag: true },
            { id: 32, name: 'F', flag: true },
            { id: 64, name: 'S', flag: true },
          ];
    }
    else {
        if ((frequency & 1) > 0) {
            // freqInString.push( { id: 1, name: 'S', flag: false });
            freqInString[0] = { id: 1, name: 'S', flag: true }
        }
        if ((frequency & 2) > 0) {
            // freqInString.push( { id: 2, name: 'M', flag: false })
            freqInString[1] = { id: 2, name: 'M', flag: true }
        }
        if ((frequency & 4) > 0) {
            // freqInString.push( { id: 4, name: 'T', flag: false })
            freqInString[2] = { id: 4, name: 'T', flag: true }
        }
        if ((frequency & 8) > 0) {
            // freqInString.push( { id: 8, name: 'W', flag: false })
            freqInString[3] = { id: 8, name: 'W', flag: true }
        }
        if ((frequency & 16) > 0) {
            // freqInString.push( { id: 16, name: 'T', flag: false })
            freqInString[4] = { id: 16, name: 'T', flag: true }
        }
        if ((frequency & 32) > 0) {
            // freqInString.push( { id: 32, name: 'F', flag: false })
            freqInString[5] = { id: 32, name: 'F', flag: true }
        }
        if ((frequency & 64) > 0) {
            // freqInString.push( { id: 64, name: 'S', flag: false })
            freqInString[6] = { id: 64, name: 'S', flag: true }
        }
    }
    return freqInString;
}
}