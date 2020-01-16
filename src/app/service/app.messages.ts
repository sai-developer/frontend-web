import { Injectable } from '@angular/core';
import { CommonData } from '../service/common-data';

@Injectable()
export class AppMessages  {
    bayName: any;
    constructor(private constants: CommonData) {
        console.log('message..', constants);
        // DOM issue happend while loading from app.service to toTitleCase in message page itself, to be moved to app service page
        this.bayName = this.constants.bayTitle.charAt(0).toUpperCase() + this.constants.bayTitle.slice(1).toLowerCase();
    }

    getMessage(msg, data) {
        const message: any = {
            // Staff
            'STAFF_CREATE' : 'Staff record has been created successfully for ' + data,
            'STAFF_UPDATE' : 'Staff record has been updated successfully for ' + data,
            'STAFF_DELETE' : 'Staff record has been deleted successfully for ' + data,
            'STAFF_DUPLICATE' : 'Staff record already exists for ' + data,
            // Shift
            'SHIFT_CREATE' : data + ' shift has been created successfully',
            'SHIFT_UPDATE' : data + ' shift has been updated successfully',
            'SHIFT_DELETE' : data + ' shift has been deleted successfully',
            'SHIFT_DUPLICATE' : 'Shift record already exists for ' + data,
            // Bay
           
            'BAY_CREATE' :  this.bayName +' '+ data + ' has been added successfully',
            'BAY_UPDATE' :  this.bayName +' '+ data + ' has been updated successfully',
            'BAY_DELETE' :  this.bayName +' '+ data + ' has been deleted successfully',
            'BAY_DUPLICATE' : this.bayName + ' already exists for ' +' '+data,
            // live status
        
            'FLIGHT_CREATE': 'Flight '  +  data  +  '  has been added succesfully',
            'FLIGHT_UPDATE': 'Flight ' + data  + ' has been updated successfully.',
            'FLIGHT_DELETE': 'Flight '  +  data  +   '  has been deleted succesfully',
            'FLIGHT_DUPLICATE': 'Flight details already exists',
            // Task Info
            'TASK_INFO_CREATE' : ' has been added  successfully for  the combination : ',
            'TASK_INFO_UPDATE' : ' has been updated successfully for  the combination : ',
            'TASK_INFO_DELETE' : ' has been deleted successfully for  the combination : ',
            // Application level Errors
            'APP_ERROR' : 'Server Error ' , data,
            // Task Summmary message
            'SUMMARY_UPDATE' : 'Task has been updated successfully',
            // Password Reset message
            'PASSWORD_RESET' : 'Password has been reset successfully',
            // Aircraft Info messages
           
            'AIRCRAFT_CREATE' : 'Tail number  ' + data + ' has been added successfully',
            'AIRCRAFT_UPDATE' :  'Tail number ' + data + ' has been updated successfully',
            'AIRCRAFT_DELETE' :  'Tail number  ' + data + ' has been deleted successfully',
            'AIRCRAFT_DUPLICATE' : 'Tail number already exists for ' + data,
            //
            //'GENERAL_NO_DATA' : 'Sorry, No data available ',            
            'CONT_CREATE': 'Contract has been created successfully.',
        };
        return message[msg];
    }
}
