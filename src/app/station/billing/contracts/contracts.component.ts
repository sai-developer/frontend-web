import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatStepper } from '@angular/material';
import { AppService } from 'app/service/app.service';
import { AppUrl } from 'app/service/app.url-service';
import { ApiService } from 'app/service/app.api-service';
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

  constructor(private appService: AppService, private service: ApiService, private AppUrl: AppUrl) { }

  ngOnInit() {
    this.secId = '';
    this.value = 'noData';
    this.activeEquip = 'B737F';
    this.flightType = 'base';
    this.appService.search.next('FILTER');
    this.contractType = false;
    this.staffs = [{ type: "Duty Manager" }, { type: "Supervisor" }, { type: "Ramp Agent" }, { type: "Baggage Handler" }];
    this.equipmentList = [{ type: "B737F", value: "DOM" }, { type: "Q400 NextGen", value: "INT" }, { type: "737-800", value: "DOM" }, { type: "737-MAX", value: "INT" }, { type: "737-700", value: "INT" }, { type: "737-900", value: "INT" }];
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
    this.EquipDetailsList = [
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
      },
      {
        "id": 2,
        "name": "Supplementary equipment",
        "service_category": [

        ]
      },
      {
        "id": 5,
        "name": "Extras",
        "service_category": [

        ]
      }
    ]
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
    this.getContracts();
  }


  ngOnDestroy() {
    this.appService.search.next(' ');
  }

  getContracts() {
    this.service.getAll(this.AppUrl.geturlfunction('GET_CONTRACT')).subscribe(res => {
      this.currency = res.data.clientInfo.currency;
      this.equipList = res.data.clientInfo.equipments;
      this.serveList = res.data.contractServices.service;
      this.clientList = res.data.clientInfo.clients;
      console.log(this.currency)
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
  }

  goBack(stepper: MatStepper) {
    stepper.previous();
  }
  goNext(stepper: MatStepper) {
    stepper.next();
  }

}
