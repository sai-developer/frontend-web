import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  flight: any;
  eqpList: any;
  add: Boolean = false;
  addMan: Boolean = false;
  formData: any;
  manList: any;
  manData: any;
  eqpMaster: any;
  constructor(private dialogRef: MatDialogRef<InvoiceComponent>, @Inject(MAT_DIALOG_DATA) public details: any) {
    this.flight = this.details.flights;
    console.log(this.flight);
  }

  ngOnInit() {
    this.add = false;
    this.addMan = false;
    this.formData = {};
    this.manData = {};
    this.eqpPayload();
    this.manPayload();
    this.eqpMasterData();
  }
  swap() {
    this.add = true;
  }
  swapMan(){
    this.addMan = true;
  }
  eqpMasterData(){
    this.eqpMaster = [
      {
        "equipment": 'Baggage Trolly'
      },
      {
        "equipment": 'Diesel Tractor'
      },
      {
        "equipment": 'Cones'
      },
      {
        "equipment": 'Chocks'
      },
      {
        "equipment": 'Headset'
      },
      {
        "equipment": 'Conveyor belt loader'
      },
      {
        "equipment": 'Pax Step Ladder'
      },
      {
        "equipment": 'Passenger Coach'
      },
      {
        "equipment": 'Ambulift'
      },
      {
        "equipment": 'Push Back-Narrow Body'
      }
    ]
  }
  addEqp(data: any) {
    let tmp = {
      "used": data.used,
      "qty": data.qty,
      "from": data.from,
      "to": data.to,
      "duration": data.duration,
      "remarks": data.remarks
    }
    this.eqpList.push(tmp);
    this.formData = {};
    this.add = false;
  }
  addPower(data: any) {
    let tmp = {
      "role": data.role,
      "qty": data.qty,
      "from": data.from,
      "to": data.to,
      "duration": data.duration,
      "remarks": data.remarks
    }
    this.manList.push(tmp);
    this.manData = {};
    this.addMan = false;
  }
  close() {
    this.add = false;
  }
  closeMan(){
    this.addMan = false;
  }
  manPayload() {
    this.manList = [
      {
        "role": 'Blue collar',
        "from": '23:00',
        "to": '01:00',
        "qty": '4',
        "duration": '02:00',
        "remarks": 'FOR DEP CARGO STAFF'
      },
      {
        "role": 'White collar',
        "from": '23:00',
        "to": '01:00',
        "qty": '2',
        "duration": '02:00',
        "remarks": 'FOR DEP CARGO STAFF'
      },
      {
        "role": 'Marshaller',
        "from": '23:00',
        "to": '01:00',
        "qty": '1',
        "duration": '02:00',
        "remarks": ''
      }
    ]
  }
  eqpPayload() {
    this.eqpList = [
      {
        "used": 'Baggage Trolly',
        "qty": '1',
        "from": '23:00',
        "to": '01:00',
        "duration": '02:00',
        "remarks": 'FOR DEP CARGO'
      },
      {
        "used": 'Diesel Tractor',
        "qty": '1',
        "from": '23:00',
        "to": '01:00',
        "duration": '02:00',
        "remarks": 'FOR DEP CARGO'
      },
      {
        "used": 'Baggage Trolly',
        "qty": '1',
        "from": '23:30',
        "to": '02:40',
        "duration": '03:10',
        "remarks": 'FOR BMA'
      },
      {
        "used": 'Diesel Tractor',
        "qty": '1',
        "from": '02:30',
        "to": '04:00',
        "duration": '01:30',
        "remarks": 'FOR RAMP/BMA/BBA'
      },
      {
        "used": 'Diesel Tractor',
        "qty": '1',
        "from": '02:30',
        "to": '04:00',
        "duration": '01:30',
        "remarks": 'FOR RAMP/BMA/BBA'
      },
      {
        "used": 'Cones',
        "qty": '1',
        "from": '03:00',
        "to": '03:51',
        "duration": '00:51',
        "remarks": ''
      },
      {
        "used": 'Chocks',
        "qty": '1',
        "from": '03:00',
        "to": '03:51',
        "duration": '00:51',
        "remarks": ''
      },
      {
        "used": 'Headset',
        "qty": '1',
        "from": '03:00',
        "to": '03:55',
        "duration": '00:55',
        "remarks": 'FOR ARR DEP'
      },
      {
        "used": 'Baggage Trolly',
        "qty": '1',
        "from": '03:00',
        "to": '04:10',
        "duration": '01:10',
        "remarks": 'FOR BBA'
      },
      {
        "used": 'Conveyor belt Loader',
        "qty": '1',
        "from": '03:02',
        "to": '03:43',
        "duration": '00:41',
        "remarks": 'FOR FRONT HOLD'
      },
      {
        "used": 'Pax Step Ladder(remote bay) Motorized - Narrow Body',
        "qty": '1',
        "from": '03:02',
        "to": '03:50',
        "duration": '00:48',
        "remarks": 'FOR FRONT DOOR'
      },
      {
        "used": 'Conveyor belt Loader',
        "qty": '1',
        "from": '03:03',
        "to": '03:44',
        "duration": '00:41',
        "remarks": 'FOR REAR HOLD'
      },
      {
        "used": 'Pax Step Ladder(remote bay) Motorized - Narrow Body',
        "qty": '1',
        "from": '03:03',
        "to": '03:45',
        "duration": '00:42',
        "remarks": 'FOR REAR DOOR'
      },
      {
        "used": 'Passenger Coach',
        "qty": '1',
        "from": '03:05',
        "to": '03:45',
        "duration": '00:40',
        "remarks": 'FOR ARR/DEP'
      },
      {
        "used": 'Passenger Coach',
        "qty": '1',
        "from": '03:05',
        "to": '03:45',
        "duration": '00:40',
        "remarks": 'FOR ARR/DEP'
      },
      {
        "used": 'Passenger Coach',
        "qty": '1',
        "from": '03:05',
        "to": '03:45',
        "duration": '00:40',
        "remarks": 'FOR ARR/DEP'
      },
      {
        "used": 'Passenger Coach',
        "qty": '1',
        "from": '03:05',
        "to": '03:45',
        "duration": '00:40',
        "remarks": 'FOR ARR/DEP'
      },
      {
        "used": 'Ambulift',
        "qty": '1',
        "from": '03:06',
        "to": '03:15',
        "duration": '00:09',
        "remarks": 'FOR ARR'
      },
      {
        "used": 'Ambulift',
        "qty": '1',
        "from": '03:30',
        "to": '03:40',
        "duration": '00:10',
        "remarks": 'FOR DEP'
      },
      {
        "used": 'Push Back-Narrow Body',
        "qty": '1',
        "from": '03:50',
        "to": '03:55',
        "duration": '00:05',
        "remarks": 'FOR FINAL PUSH'
      },
    ];
  }

}