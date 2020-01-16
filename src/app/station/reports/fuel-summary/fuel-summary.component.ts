import { Component, OnInit } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { AppService, AuthService } from "../../../service/app.service";

@Component({
  selector: 'app-fuel-summary',
  templateUrl: './fuel-summary.component.html',
  styleUrls: ['./fuel-summary.component.scss']
})
export class FuelSummaryComponent implements OnInit {
  stateSubscription: any;
  searchText: string;

  constructor(private services: ApiService, private AppUrl: AppUrl, private appService: AppService) { }
  fuelDetails: any = [];
  load: any;
  ngOnInit() {
    this.getFuelSummary();
    this.subscribeActions();
  }

  //function call to clear the search text
  subscribeActions() {
    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })
  }


  //api  reponse call for the fuel summary details data
  getFuelSummary() {
    this.load = true;
    this.services.getAll(this.AppUrl.geturlfunction('FUEL_GET')).subscribe(res => {
      if (res.status) {
        this.load = false;
        let fuelDet = res.data.filter(
          flight => flight.actualDepartureTime !== null);
        this.fuelDetails = this.appService.sortNumber(fuelDet, 'standardDepartureTime');
        console.log(this.fuelDetails)
      }
      else {
        this.load = false;
      }
    }, error => {
      console.log('error');
      this.load = false;
    });
  }
}
