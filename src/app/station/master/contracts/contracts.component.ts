import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatStepper } from '@angular/material';
import { AppService, AuthService } from 'app/service/app.service';
import { AppUrl } from 'app/service/app.url-service';
import { ApiService } from 'app/service/app.api-service';
import * as momentzone from 'moment-timezone';
import * as _ from 'underscore';
// import { FilterPipe } from '../../../service/app.pipe';

// Inbuild Formats/Options for the Material date picker
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD MMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  // providers: [FilterPipe]
})
export class ContractsComponent implements OnInit {
  equipList: { type: string; }[];
  contractType: Boolean = false;
  noData: any = true;
  secId: any;
  searchText: any;
  searchInt: any;
  serveList: any;
  services: any;
  currency: any;
  value: any;
  flights: any;
  clientList: any;
  activeEquip: any;
  equipmentList: { type: string; value: string; }[];
  flightType: any;
  staffs: { type: string; }[];
  EquipDetailsList: { "id": number; "name": string; "service_category": { "name": string; }[]; }[];
  frequency: { "id": number; "cnt": string }[];
  dispDom: any;
  cnt: any = {};
  currentStation: any;
  EquipDetailList: { "id": number; "name": string; "service_category": { "name": string; }[]; }[];
  minToday: any;
  unitType: { id: number; value: string; }[];

  constructor(private appService: AppService, private service: ApiService, private AppUrl: AppUrl, private auth: AuthService) { }

  ngOnInit() {
    this.secId = '';
    this.value = 'noData';
    // this.activeEquip = 'B737F';
    this.flightType = 'base';
    this.appService.search.next('FILTER');
    this.contractType = false;
    this.staffs = [{ type: "Duty Manager" }, { type: "Supervisor" }, { type: "Ramp Agent" }, { type: "Baggage Handler" }];
    this.equipmentList = [{ type: "B737F", value: "DOM" }, { type: "Q400 NextGen", value: "INTL" }];
    this.frequency = [{ id: 1, cnt: 'Weekly' }, { id: 2, cnt: 'Monthly' }, { id: 3, cnt: 'Annually' }];
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code,
      "zone": this.auth.user.airport.timezone
    }
    this.unitType = [{ id: 1, value: 'Time' }, { id: 2, value: 'Unit' }]
    this.minToday = momentzone().tz(this.currentStation.zone);
    this.getCreatedContracts();
    // this.currency = [{ id: 1, value: '(₹) Indian Rupee' }, { id: 2, value: '($) US Dollar' }]
    // this.services = [
    //   {
    //     serviceType: 1,
    //     task: "Passenger & Ramp Services"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Baggage Services"

    //   },
    //   {
    //     serviceType: 1,
    //     task: "Ticketing Services"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Lost & Found Services"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Gate & Check-in Services"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Lounge Operations"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "VIP Services"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Station Management & Control"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Irregularity Handling"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Load Control"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "Crew Administration"
    //   },
    //   {
    //     serviceType: 1,
    //     task: "De-icing"
    //   },
    //   // security tasks
    //   {
    //     serviceType: 2,
    //     task: "Document Verification"
    //   },
    //   {
    //     serviceType: 2,
    //     task: "Access Control"
    //   },
    //   {
    //     serviceType: 2,
    //     task: "Passenger Screening"
    //   },
    //   {
    //     serviceType: 2,
    //     task: "Aircraft Security Service"
    //   },
    //   {
    //     serviceType: 2,
    //     task: "Cargo and Baggage Screening"
    //   },
    //   {
    //     serviceType: 2,
    //     task: "Integrated Security"
    //   },
    // ];
    // this.EquipDetailsList = [
    //   {
    //     "id": 3,
    //     "name": "Pax Handling",
    //     "service_category": [
    //       {
    //         "name": "Passenger Shuttle Coach"
    //       },
    //       {
    //         "name": "Towable Step Ladder with Canopy"
    //       }
    //     ]
    //   },
    //   {
    //     "id": 4,
    //     "name": "Baggage Handling",
    //     "service_category": [
    //       {
    //         "name": "Towable Baggage Freight Loader"
    //       },
    //       {
    //         "name": "Towable Baggage Trolley-Open Type"
    //       },
    //       {
    //         "name": "Towable Baggage Trolley-Closed Type"
    //       },
    //       {
    //         "name": "Baggage Trolley"
    //       },
    //       {
    //         "name": "Close Baggage Trolley (8*5)"
    //       }
    //     ]
    //   },
    //   {
    //     "id": 1,
    //     "name": "Aircraft Servicing",
    //     "service_category": [
    //       {
    //         "name": "Baggage Services"
    //       },
    //       {
    //         "name": "Passenger & Ramp Services"
    //       }
    //     ]
    //   },
    //   {
    //     "id": 2,
    //     "name": "Supplementary equipment",
    //     "service_category": [

    //     ]
    //   },
    //   {
    //     "id": 5,
    //     "name": "Extras",
    //     "service_category": [

    //     ]
    //   }
    // ]
    this.flights = [
      {
        "clientName": 'Long Haul',
        "contractType": 'COMPREHENSIVE',
        "eqpType": [
          {
            "type": 'B737'
          },
          {
            "type": 'Q400'
          }
        ],
        "airline": 'spice-jet',
        "bg": 'spice',
        "start": '01 April 2019',
        "end": '31 Mar 2020'
      },
      {
        "clientName": 'Domestic',
        "contractType": 'COMPREHENSIVE',
        "eqpType": [
          {
            "type": 'B737'
          },
          {
            "type": 'Q400'
          },
          {
            "type": '737-MAX'
          }
        ],
        "airline": 'aer-lingus',
        "bg": 'al',
        "start": '01 October 2018',
        "end": '31 July 2019'
      },
      {
        "clientName": 'International',
        "contractType": 'COMPREHENSIVE',
        "eqpType": [
          {
            "type": 'B737'
          },
          {
            "type": '737-800'
          }
        ],
        "airline": 'anz-logo',
        "bg": 'anz',
        "start": '01 January 2019',
        "end": '31 May 2020'
      },
      {
        "clientName": 'Domestic Flights',
        "contractType": 'COMPREHENSIVE',
        "eqpType": [
          {
            "type": '737-800'
          },
          {
            "type": '737-MAX'
          }
        ],
        "airline": 'spice-jet',
        "bg": 'spice',
        "start": '01 June 2018',
        "end": '31 Mar 2019'
      }
    ];

    this.EquipDetailList = [
      {
        "id": 3,
        "name": "Pax Handling",
        "service_category": [
          {
            "name": "Passenger Shuttle Coach"
          },
          {
            "name": "Towable Step Ladder with Canopy"
          }
        ]
      },
      {
        "id": 4,
        "name": "Baggage Handling",
        "service_category": [
          {
            "name": "Towable Baggage Freight Loader"
          },
          {
            "name": "Towable Baggage Trolley-Open Type"
          },
          {
            "name": "Towable Baggage Trolley-Closed Type"
          },
          {
            "name": "Baggage Trolley"
          },
          {
            "name": "Close Baggage Trolley (8*5)"
          }
        ]
      },
      {
        "id": 1,
        "name": "Aircraft Servicing",
        "service_category": [
          {
            "name": "Baggage Services"
          },
          {
            "name": "Passenger & Ramp Services"
          }
        ]
      }
    ]

    this.getContracts();
  }


  ngOnDestroy() {
    this.appService.search.next(' ');
  }

  getContracts() {
    this.service.getAll(this.AppUrl.geturlfunction('GET_CONTRACT')).subscribe(res => {
      console.log(res.data);
      this.currency = res.data.clientInfo.currency;
      this.equipList = res.data.clientInfo.aircraft;
      this.serveList = res.data.contractServices.service;
      this.clientList = res.data.clientInfo.clients;
      this.EquipDetailsList = res.data.contractServices.equipments;
      console.log(this.serveList)
    }, error => {
      console.log("error")
    });
  }
  contractList: any;
  dispList: any;
  contractLength: any;
  getCreatedContracts() {
    this.service.getAll(this.AppUrl.geturlfunction('POST_CONTRACT')).subscribe(res => {
      if (res.status) {
        console.log(res.data);
        this.contractList = res.data;
        this.contractLength = this.contractList.length;
      //   for (let index = 0; index < this.contractList.length; index++) {
      //     const element = this.contractList[index];
      //     if(element.client_name == 'Aer Lingus'){
      //       element.bg = 'al';
      //       element.airline = 'aer-lingus'
      //       this.contractList.push(element);
      //     } else if(element.client_name == 'SpiceJet'){
      //       element.bg = 'spice';
      //       element.airline = 'spice-jet'
      //       this.contractList.push(element);
      //     }
      // }
      console.log(this.contractList);
        this.dispList = this.contractList;
      }
      console.log(res);
    }, error => {
      console.log("error")
    });
  }

  equipType(value) {
    console.log(value)
    this.activeEquip = value;
  }

  contType(data: any) {
    if (data == 'comp') {
      this.contractType = true;
    } else {
      this.contractType = false;
    }
  }

  typeFlight(data: any) {
    console.log(data)
    this.flightType = data;
  }

  actionClick(value) {
    console.log(value)
    this.value = value;
    window.scrollTo(0,0);
  }

  goBack(stepper: MatStepper) {
    stepper.previous();
  }
  goNext(stepper: MatStepper) {
    stepper.next();
    window.scrollTo(0,0);
  }
  postData(data: any) {
    console.log(data);
    var tmpFrom = data.from ? momentzone(data.from._d).tz(this.currentStation.zone).startOf('day').format('D MMM YYYY') : '';
    var tmpTo = data.to ? momentzone(data.to._d).tz(this.currentStation.zone).endOf('day').format('D MMM YYYY') : '';

    console.log(tmpFrom);
    console.log(tmpTo);
    var sendData = {
      "name": data.contractName,
      "client_id": data.clientName,
      "currency_id": data.currency,
      "type": 1,
      "effective_from": tmpFrom,
      "effective_to": tmpTo,
      "equipmentDom" : this.tmpDom ? this.tmpDom.id : '',
      "equipmentIntl" : this.tmpInt ? this.tmpInt.id : ''
    }
    console.log(sendData);
    this.service.create(this.AppUrl.geturlfunction('POST_CONTRACT'), sendData).subscribe(res => {
      if (res.status === true) {
        this.appService.showToast('CONT_CREATE', '', 'success');
        this.getCreatedContracts();
      }
      else {
        // if (res.errorMessage.includes('Record already exists') || res.errorMessage.includes('duplicate') === true) {
        //   this.appService.showToast('FLIGHT_DUPLICATE', '', 'warning');
        // }
      }
      this.getCreatedContracts();
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
    this.cnt = {};
    this.getCreatedContracts();
    console.log(sendData)
  }

  tmpDom: any;
  tmpInt: any;
  tmpEqp = [];
  eqpList(type, data) {
    console.log(type, data);
    if (type == 'dom') {
      this.tmpDom = data;
      this.tmpDom.carr = 'DOM'
      this.activeEquip = this.tmpDom.name
      this.tmpEqp.push(this.tmpDom);
    } else if (type == 'int') {
      this.tmpInt = data;
      this.tmpInt.carr = 'INTL'
      this.tmpEqp.push(this.tmpInt);
    }
    console.log(this.tmpEqp);
    // if (type == 'dom') {
    //   if (this.tmpDom.includes(data.id)) {
    //     var index = this.tmpDom.indexOf(data.id);
    //     this.tmpDom = _.without(this.tmpDom, _.findWhere(this.tmpDom, index));
    //   } else {
    //     this.tmpDom.push(data.id);
    //   }
    //   console.log(this.tmpDom);
    // } else if (type == 'int') {
    //   if (this.tmpInt.includes(data.id)) {
    //     var index = this.tmpInt.indexOf(data.id);
    //     this.tmpInt = _.without(this.tmpInt, _.findWhere(this.tmpInt, index));
    //   } else {
    //     this.tmpInt.push(data.id);
    //   }
    //   console.log(this.tmpInt);
    // }

  }
  minToDate: any;
  minDate(data) {
    this.minToDate = data;
  }

}
