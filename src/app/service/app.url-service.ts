import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import * as motimezone from 'moment-timezone';
import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { AuthService } from "../service/app.service";


@Injectable()
export class AppUrl {

    sod: any;
    eod: any;
    sond: any;
    eond: any;
    currentDate: any;
    sodUTC: any;
    eodUTC: any;
    sondUTC: any;
    eondUTC: any;
    timezone: any;
    constructor(private auth: AuthService) {
    }
    getTimeZone() {
        this.timezone = this.auth.user.airport.timezone;
        this.sod = motimezone().tz(this.timezone).startOf('day').utc().unix() * 1000;
        // this.sod = motimezone().tz(this.timezone).startOf('day').format('DD-MMM-YYYY').toString();
        this.eod = motimezone().tz(this.timezone).endOf('day').utc().unix() * 1000;
        this.sond = motimezone().tz(this.timezone).add("days", 1).startOf('day').utc().unix() * 1000;
        this.eond = motimezone().tz(this.timezone).add("days", 1).endOf('day').utc().unix() * 1000;
        this.sodUTC = motimezone().tz(this.timezone).startOf('day').utc().unix() * 1000;
        this.eodUTC = motimezone().tz(this.timezone).endOf('day').utc().unix() * 1000;
        // this.sondUTC = motimezone().tz(this.timezone).add("days",1).startOf('day').utc().unix()*1000;
        // this.eondUTC = motimezone().tz(this.timezone).add("days",1).endOf('day').utc().unix()*1000;
        // Need to find why utc is used, -> used it for a bug didn't remember
        // this.sodUTC = moment().startOf('day').utc().unix()*1000;
        // this.eodUTC = moment().endOf('day').utc().unix()*1000;
        this.sondUTC = moment().add("days", 1).startOf('day').utc().unix() * 1000;
        this.eondUTC = moment().add("days", 1).endOf('day').utc().unix() * 1000;
        this.currentDate = motimezone().tz(this.timezone).startOf('day').format('DD-MM-YYYY').toString();
    }

    getLoginApi(param) {
        let obj: any = {
            LOGIN: environment.baseurl + 'login'
        }
        return obj[param]
    }

    getMqttTopic(param) {

        let object: any = {
            CHOCKS_ON: "/TS/CHOCKS_ON",
            CHOCKS_OFF: "/TS/CHOCKS_OFF",
            TASK_COMPLETE: "/TS/COMPLETE",
            TASK_ASSIGN_COUNT: "/TA/TASK_ASSIGN_COUNT",
            TASK_ASSIGN: "/TA/TASK_ASSIGN",
            ETA_ETD_CHANGE: "/FS/ETA_ETD_CHANGE",
            WEB_CHOCKS_ON: "/TS/WEB_CHOCKS_ON",
            WEB_CHOCKS_OFF: "/TS/WEB_CHOCKS_OFF",
            BAY_CHANGE_NOTIFY: "/FS/BAY_CHANGE_NOTIFY",
            ETACRON: "/LAST_SHORT_ARRIVE_NOTIFY",
            CHOCKS_COUNT: "/TS/CHOCKS_COUNT",
            TASK_ASSIGN_V2: "/TS/TASK_ASSIGN_V2",
            TURN_COLOR: "/TS/TURNCOLOR"
        }
        return object[param]
    }
    getReport(start, end) {
        console.log(start, end);
        start = start || this.sod;
        end = end || this.eod;
        console.log(start, end);
        // return environment.baseurl + 'getTaskSchedResMappingByDate?from=' + start + '&to=' + end + '&airport=' + this.auth.user.userAirportMappingList[0].code + '';
        return environment.baseurl + 'getDDR?from=' + start + '&to=' + end + '&airport=' + this.auth.user.userAirportMappingList[0].code + '';
    }
    geturlfunction(param) {
        let obj: any = {

            /*fsc dashboard*/
            REGION_LIST: environment.baseurl + 'getRegion',
            GET_TIME_BY_ZONE: environment.baseurl + 'getTimeByZone?zone=' + this.auth.user.userAirportMappingList[0].code,




            FSC_BY_ALL: environment.baseurl + 'getfsc?from=' + this.sod + '&to=' + this.eod + '&by=',
            FSC_BY_REGION: environment.baseurl + 'getfsc?from=' + this.sod + '&to=' + this.eod + '&by=region&region_id=',
            FSC_BY_STATION: environment.baseurl + 'getfsc?from=' + this.sod + '&to=' + this.eod + '&by=station&station_id=',

            FSC_OTP_BY_ALL: environment.baseurl + 'getOtpByDate?from=' + this.sod + '&to=' + this.eod + '&zone=' + this.auth.user.userAirportMappingList[0].code + '&by=',
            FSC_OTP_BY_REGION: environment.baseurl + 'getOtpByDate?from=' + this.sod + '&to=' + this.eod + '&zone=' + this.auth.user.userAirportMappingList[0].code + '&by=region&region_id=',
            FSC_OTP_BY_STATION: environment.baseurl + 'getOtpByDate?from=' + this.sod + '&to=' + this.eod + '&zone=' + this.auth.user.userAirportMappingList[0].code + '&by=station&station=',

            FSC_FLIGHTS_BY_ALL: environment.baseurl + 'getfsclevelflights?from=' + this.sod + '&to=' + this.eod + '&by=',
            FSC_FLIGHTS_BY_REGION: environment.baseurl + 'getfsclevelflights?from=' + this.sod + '&to=' + this.eod + '&by=region&region_id=',
            FSC_FLIGHTS_BY_STATION: environment.baseurl + 'getfsclevelflights?from=' + this.sod + '&to=' + this.eod + '&by=station&station_id=',

            // FSC_TASKDELAY_Actual_BY_ALL :environment.baseurl + 'getDelayCategoryByActual?from=' + this.sod+ '&to=' + this.eod+ '&by=',
            // FSC_TASKDELAY_Actual_BY_REGION :environment.baseurl + 'getDelayCategoryByActual?from=' + this.sod+ '&to=' + this.eod+ '&by=region&region_id=',
            // FSC_TASKDELAY_Actual_BY_STATION :environment.baseurl + 'getDelayCategoryByActual?from=' + this.sod+ '&to=' + this.eod+ '&by=station&station_id=',

            FSC_DELAYDEPARTMENT_BY_ALL: environment.baseurl + 'getDelayByDepartment?from=' + this.sod + '&to=' + this.eod + '&by=',
            FSC_DELAYDEPARTMENT_BY_REGION: environment.baseurl + 'getDelayByDepartment?from=' + this.sod + '&to=' + this.eod + '&by=region&region_id=',
            FSC_DELAYDEPARTMENT_BY_STATION: environment.baseurl + 'getDelayByDepartment?from=' + this.sod + '&to=' + this.eod + '&by=station&station_id=',

            // FSC_TASKBYCAT_ByReport_BY_ALL :environment.baseurl + 'getDelayCategoryByReport?from=' + this.sod+ '&to=' + this.eod+ '&by=',
            // FSC_TASKBYCAT_ByReport_BY_REGION :environment.baseurl + 'getDelayCategoryByReport?from=' + this.sod+ '&to=' + this.eod+ '&by=region&region_id=',
            // FSC_TASKBYCAT_ByReport_BY_STATION :environment.baseurl + 'getDelayCategoryByReport?from=' + this.sod+ '&to=' + this.eod+ '&by=station&station_id=',

            TASKDELAY_Actual_DELAYDEPARTMENT_TASKBYCAT_ByReport_BY_ALL: environment.baseurl + 'getDelay?from=' + this.sod + '&to=' + this.eod + '&by=',
            TASKDELAY_Actual_DELAYDEPARTMENT_TASKBYCAT_ByReport_BY_REGION: environment.baseurl + 'getDelay?from=' + this.sod + '&to=' + this.eod + '&by=region&region_id=',
            TASKDELAY_Actual_DELAYDEPARTMENT_TASKBYCAT_ByReport_BY_STATION: environment.baseurl + 'getDelay?from=' + this.sod + '&to=' + this.eod + '&by=station&station_id=',

            /*flight status dashboard*/
            FLIGHT_STATUS_V1: environment.baseurl + 'getflightstatus',
            FLIGHT_STATUS_V2: environment.baseurl + 'getflightstatusByFsc?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sod,
            /* station level dashboard*/
            FLIGHTS_BY_FROM_TO: environment.baseurl + 'getFlightTaskStatusSummaryByDate?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sod + '&to=' + this.eod + '',
            FLIGHTS_BY_FROM_TO_NEXT_DAY: environment.baseurl + 'getFlightTaskStatusSummaryByDate?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sond + '&to=' + this.eond + '',

            FLIGHTS_BY_FROM_TO_UTC: environment.baseurl + 'getFlightTaskStatusSummaryByDate?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sodUTC + '&to=' + this.eodUTC + '',
            FLIGHTS_BY_FROM_TO_UTC_NEXT_DAY: environment.baseurl + 'getFlightTaskStatusSummaryByDate?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sondUTC + '&to=' + this.eondUTC + '',
            FLIGHTS_BY_FROM_TO_UTC_FILTERED: environment.baseurl + 'getFlightTaskStatusSummaryByDateFiltered?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sodUTC + '&to=' + this.eodUTC + '',

            EfficiencyFactor_BY_STATION: environment.baseurl + 'getEfficiencyFactor?from=' + this.sod + '&to=' + this.eod + '&station_id=',
            TASKSCHEDULE_SERVICES: environment.baseurl + 'getTaskSchedResMappingByFlightSchedId?id=',
            FLIGHT_GANTT: environment.baseurl + 'flight_gantt_chart?id=',

            GET_METAR: environment.baseurl + 'getMETAR?airport=',
            GET_NOTAM: environment.baseurl + 'getNOTAM?airport=',

            /*
                Flight Schedule details
            */
            GET_FLIGHT_SCHEDULE_DETAILS: environment.baseurl + 'getFlightScheduleDetails?airport=',
            GET_EQUIPMENT_TYPE_MASTER: environment.baseurl + 'getEquipmentTypeMaster',
            /* task assignment */

            GET_TASK_BY_FLIGHT: environment.baseurl +
                'getTaskSchedResMappingByFlightSchedId?airport=' + this.auth.user.userAirportMappingList[0].code + '&date=' + this.sod + '',
            GET_USER_BY_SHIFT: environment.baseurl +
                'getUserShiftByflightSchedule?airport=' + this.auth.user.userAirportMappingList[0].code + '&date=' +
                this.sod + '&userRole=' + this.auth.user.userRoleMasterList[0].id + '&flightSchId=',
            /* DSP Not used */
            // GET_USER_BY_FLIGHT: environment.baseurl +
            //   'getLCCUsers?airport=' + this.auth.user.userAirportMappingList[0].code + '&flightScheduleId=',

            /* ResourceMapping */
            RESOURCE_MAPPING: environment.baseurl + 'ResourceMapping/create',
            RESOURCE_MAPPING_UPDATE: environment.baseurl + 'ResourceMapping/update',


            GET_BAY_BY_STATION: environment.baseurl + 'getBayMasterList?airport=',
            BAY_NUMBER_CREATE: environment.baseurl + 'bayMaster/create',
            BAY_NUMBER_UPDATE: environment.baseurl + 'bayMaster/update',
            USER_MASTER_CREATE: environment.baseurl + 'UserMaster/create',
            USER_MASTER_UPDATE: environment.baseurl + 'UserMaster/update',

            TASKDEPENDENCY_DETAILS_CREATE: environment.baseurl + 'taskDependency/bulkCreate',
            TASKDEPENDENCY_DETAILS_UPDATE: environment.baseurl + 'taskDependency/bulkUpdate',
            TASKDEPENDENCY_DETAILS_DELETE: environment.baseurl + 'taskDependency/delete',
            TASKDEPENDENCY_SERVICE_ByID: environment.baseurl + 'taskDependency?task_schedule_master_id=',



            FLIGHT_SCHEDULE_UPDATE: environment.baseurl + 'FlightSchedule/update',

            //GET_SHIFT_BY_STATION :environment.baseurl + 'getShifts?airport=',
            GET_SHIFTS_WITH_LEGEND: environment.baseurl + 'getShiftsWithLegend?airport=',
            //SHIFT_SERVICE_UPDATE :environment.baseurl + 'shiftMaster/update',
            //SHIFT_SERVICE_CREATE :environment.baseurl + 'shiftMaster/create',
            GET_SHIFT_BY_STATION: environment.baseurl + 'getShiftsTZ?airport=',
            SHIFT_SERVICE_UPDATE: environment.baseurl + 'shiftMasterTZ/update?airport=' + this.auth.user.userAirportMappingList[0].code + '',
            SHIFT_SERVICE_CREATE: environment.baseurl + 'shiftMasterTZ/create?airport=' + this.auth.user.userAirportMappingList[0].code + '',

            GET_STAFF_BY_STATION: environment.baseurl + 'getUsers?airport=',
            GET_STAFF_LOCATION: environment.baseurl + 'getStaffLocation?airport=' + this.auth.user.userAirportMappingList[0].code + '&date=' + this.currentDate,

            GET_ROLE_MASTER: environment.baseurl + 'getroleMaster',


            GET_DELAY_TASK_MAPPING: environment.baseurl + "delayTaskMapping",

            GET_TASK_MASTERLIST: environment.baseurl + "getTaskMasterList",
            DELAY_TASK_MAPPING: environment.baseurl + "delayTaskMapping",
            DELAY_CODES: environment.baseurl + "delayCodes",
            DELAY_TASK_MAPPING_POST: environment.baseurl + "delayTaskMapping/bulkCreate",
            DELAY_TASK_MAPPING_UPDATE: environment.baseurl + "delayTaskMapping/bulkUpdate",
            DELAY_TASK_MAPPING_DELETE: environment.baseurl + "delayTaskMapping/delete",

            ROSTER_DOWNLOAD_EXCEL: environment.baseurl + "downloadExcel",
            ROSTER_UPLOAD_EXCEL: environment.baseurl + "uploadExcel",
            ROSTER_IS_EXIST: environment.baseurl + "checkRosterExist",
            ROSTER_CREATE: environment.baseurl + "roster/create",
            GET_ROSTER_VIEW: environment.baseurl + 'getRoster?',
            CONSOLIDATE_FLIGHT_DEPARTURE_VIEW: environment.baseurl + 'view_by_departure?',
            CONSOLIDATE_FLIGHT_ARRIVAL_VIEW: environment.baseurl + 'view_by_arrival?',
            CONSOLIDATE_TASK_VIEW: environment.baseurl + 'view_by_task?',

            GET_SCHEDULE_DENSITY: environment.baseurl + 'scheduleDensity?',
            CHECKUSERACTION: environment.baseurl + 'getUserTaskDetails?from=' + this.sod + '&to=' + this.eod + '&user_id=',

            UPLOAD_MAYFLY: environment.baseurl + 'mayfly?airport=' + this.auth.user.userAirportMappingList[0].code + '',

            // DDR api
            /* DSP confirmed by issmu
            remove not used */
            // REPORT_GET: environment.baseurl + 'getTaskSchedResMappingByDate?from=' + this.sod + '&to=' + this.eod + '&airport=' + this.auth.user.userAirportMappingList[0].code + '',
            REPORT_UPDATE: environment.baseurl + 'dailyDelayReport/update',
            //Task Master api
            GET_TASKS_BY_COMBO: environment.baseurl + 'getTaskScheduleList?',
            GET_DEPENDENCY_TASKS: environment.baseurl + 'taskDependency?task_schedule_master_id=',
            TASK_MASTER_CREATE: environment.baseurl + 'taskScheduleDetails/create',
            TASK_MASTER_UPDATE: environment.baseurl + 'taskScheduleDetails/update',
            EQUIPMENT_TYPE_SERVICE: environment.baseurl + 'getEquipmentTypeMaster',

            // Airport master list
            AIRPORT_SERVICE: environment.baseurl + 'getAirportMaster',

            // Adding new flight (flight info)
            ADD_TODAY_FLIGHT: environment.baseurl + 'FlightSchedule/create',
            UPDATE_TODAY_FLIGHT: environment.baseurl + 'FlightSchedule/update',

            // Registration nummber list
            EQUIPMENT_SERVICE: environment.baseurl + 'getEquipmentMaster',
            EQUIPMENT_SERVICE_BY_GROUP: environment.baseurl + 'getEquipmentMasterByGroup',
            EQUIPMENT_SERVICE_CREATE: environment.baseurl + 'equipmentMaster/create',
            EQUIPMENT_SERVICE_UPDATE: environment.baseurl + 'equipmentMaster/update',
            EQUIPMENT_SERVICE_DELETE: environment.baseurl + 'equipmentMaster/update',

            //CHANGE PASSWORD
            CHANGE_PASSWORD: environment.baseurl + 'admin/changePassword',

            // Update of Task Summary

            TASK_STATUS_CREATE: environment.baseurl + 'TaskStatus/create',
            TASK_STATUS_UPDATE: environment.baseurl + 'TaskStatus/update',

            // Resource Tracking
            GET_TASK_SCHEDULE_ALL_RESOUCE: environment.baseurl + 'getTaskSchedResMappingMobileByUserId?from=' + this.sod
                + '&to=' + this.eod + '&airport=' + this.auth.user.userAirportMappingList[0].code + '&id=',

            // Flight Schedule
            FLIGHT_SCHEDULE_DETAILS_CREATE: environment.baseurl + 'FlightScheduleDetails/create',
            FLIGHT_SCHEDULE_DETAILS_UPDATE: environment.baseurl + 'FlightScheduleDetails/update',

            // FUEL api
            // FUEL_GET: environment.baseurl + 'getFuelReport?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sod + '&to=' + this.eod + '',
            FUEL_GET: environment.baseurl + 'getReport?airport=' + this.auth.user.userAirportMappingList[0].code + '&from=' + this.sod + '&to=' + this.eod + '',

            // Gantt chart matrix
            MATRIX_GET: environment.baseurl + 'ganttChart?from=' + this.sod + '&to=' + this.eod + '&station=' + this.auth.user.userAirportMappingList[0].code + '',
            //Contracts api
            GET_CONTRACT: environment.baseurl + 'contract/getMeta',
            // 
            POST_CONTRACT: environment.baseurl + 'contract',
            // new airport-view staff location
            AV_STAFF: environment.baseurl + 'getTaskDetailsByFID?id=',
            //Analytics arrival otp
            GET_ANALYTICS_ARRIVAL_OTP: environment.baseurl + 'arrival_otp?by=',
            //Analytics departure otp
            GET_ANALYTICS_DEPARTURE_OTP: environment.baseurl + 'depature_otp?by=',
            //Analytics time of day
            GET_ANALYTICS_TIME_OF_DAY: environment.baseurl + 'time_of_day?by=',
            //Analytics time of week
            GET_ANALYTICS_DAY_OF_WEEK: environment.baseurl + 'day_of_week?by=',
            //Analytics recovery metrics
            GET_ANALYTICS_RECOVERY_METRICS: environment.baseurl + 'recovery?by=',
            //Analytics equipment otp
            GET_ANALYTICS_EQUIPMENT_OTP: environment.baseurl + 'equipment_otp?by=',
            //Analytics bay otp
            GET_ANALYTICS_BAY_OTP: environment.baseurl + 'bay_otp?by=',
            //TopRoutes
            GET_TOP_FIVE_ROUTES: environment.baseurl + 'top_five_routes?by=',
            GET_BOTTOM_FIVE_ROUTES: environment.baseurl + 'bottom_five_routes?by=',
            //heatmap-chart
            GET_HEATMAP_CHART: environment.baseurl + 'heat_map?by=',
            //Analytics turnaround otp
            GET_TURNAROUND_OTP: environment.baseurl + 'turnaround_otp?by=',
            //Analytics overall turnaround otp
            GET_OVERALL_TURNAROUND_OTP: environment.baseurl + 'turnaround_over_all_otp?by=',
            //Analytics bay type otp
            GET_TURNAROUND_BAY_OPT: environment.baseurl + 'turnaround_bay_otp?by=',
            //Analytics equipment type otp
            GET_TURNAROUND_EQUIP_TYPE_OTP: environment.baseurl + 'turnaround_equipment?by=',
            //TURNAROUND BY  DEPARTMENTS
            GET_TURNAROUND_BY_DEPARTMENTS: environment.baseurl + 'department_turnaround?by=',
            //DEPARTMENT BY TOD 
            GET_TURNAROUND_DEPARTMENT_BY_TOD: environment.baseurl + 'department_tod?by=',
            //DEPARTMENT BY DOW
            GET_TURNAROUND_DEPARTMENT_BY_DOW: environment.baseurl + 'department_dow?by=',
            //DEPARTMENT BY HEATMAP
            GET_TURNAROUND_DEPARTMENT_BY_HEATMAP: environment.baseurl + 'department_heatmap?by=',
            //department by task view_by_task
            GET_TURNAROUND_DEPARTMENT_BY_TASKVIEW: environment.baseurl + 'department_by_task?by=',
            //DEPARTMENT tasks BY HEATMAP
            GET_TURNAROUND_TASK_BY_HEATMAP: environment.baseurl + 'task_heatmap?by=',
            //Tasks BY TOD 
            GET_TURNAROUND_TASK_BY_TOD: environment.baseurl + 'task_tod?by=',
            //Tasks BY DOW
            GET_TURNAROUND_TASK_BY_DOW: environment.baseurl + 'task_dow?by=',
            //Tasks BY DOW
            GET_TURNAROUND_TASK_BY_DELAYCODE: environment.baseurl + 'task_by_delay_code?by=',
            //Delay Tasks BY tod
            GET_DELAY_BY_TOD: environment.baseurl + 'dc_tod?by=',
            //Delay Tasks BY DOW
            GET_DELAY_BY_DOW: environment.baseurl + 'dc_dow?by=',
            //Delay Tasks BY DOW
            GET_TOP_FIVE_DELAY_CODES: environment.baseurl + 'top_five_delays?by=',
            //Delay Tasks BY Delay codes
            GET_CATEGORY_BY_DELAYCODES: environment.baseurl + 'delay_category_delay_code?by=',
            //Delay Tasks BY Delay codes
            GET_TOP_FIVE_DELAYTASK: environment.baseurl + 'delay_category_five_delays?by=',
            //task delay category chart
            GET_TASK_DELAY_CATEGORY: environment.baseurl + 'delay_categories_otp?by=',
            //delayed task list
            GET_DELAYED_TASK_LIST: environment.baseurl + 'get_delay_category?by=',
            //delayed task heatmap
            GET_DELAYED_TASK_HEATMAP: environment.baseurl + 'dc_heatmap?by=',
            //send ddr mail get
            GET_MAIL_CONFIG: environment.baseurl + 'ddrMail?code=' + this.auth.user.userAirportMappingList[0].code,
            //send mail
            SEND_MAIL_CONFIG: environment.baseurl + 'ddrSend',
            // get registration by eqp
            REG_BY_EQP: environment.baseurl + 'getEquipmentMasterByTypeId?typeId=',
            //NOC ANALYTICS
            NOC_ANALYTICS_TURNAROUND_OTP: environment.baseurl + 'analytics/noc/turn_otp',
            NOC_ANALYTICS_ARRIVAL_DEP_OTP: environment.baseurl + 'analytics/noc/arrival_dep_otp',
            NOC_ANALYTICS_EQUIPMENT_OTP: environment.baseurl + 'analytics/noc/equipment_otp',
            NOC_ANALYTICS_DEPARTMENT_OTP: environment.baseurl + 'analytics/noc/department_otp',
            NOC_ANALYTICS_FLIGHT_OTP: environment.baseurl + 'analytics/noc/tod',
        }
        // console.log(obj[param])
        return obj[param];
    }
    // commonUrlFun(){

    // }
    /*common need for api request parameter*/

    // setDays(tz){
    //     console.log(tz, "====================")
    // this.sod = motimezone().tz('Europe/Dublin').startOf('day').unix()*1000,
    // this.sod = motimezone().tz('Europe/Dublin').endOf('day').unix()*1000

    // }
    // timestamp to hrs and mintues
    getHrsmintues(time: any, zone: any) {
        if (time !== null) {
            return motimezone(time).tz(zone).format("HH:mm");
        } else {
            return "--:--"
        }
    }
    // timestamp to hrs and mintues
    getHrs(time: any, tz: any) {
        // console.log(time)
        // console.log(motimezone(time).tz(tz).format('HH'));
        return motimezone(time).tz(tz).format('HH');
    }
}
