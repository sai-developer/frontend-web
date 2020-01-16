import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from "@angular/router";
import { AppUrl } from "../../service/app.url-service";
import { ApiService } from "../../service/app.api-service";
import { ToastComponent } from "../../toast/toast.component";
import { GlobalConfig, ToastrService } from "ngx-toastr";
import { CookieService } from 'ngx-cookie-service';
import { AuthService, AppService } from "../../service/app.service";


@Component({
  selector: 'ms-login-session',
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {

  user: any = {};
  showPass: Boolean = false;
  showLoading: Boolean;
  animated: boolean = false;
  setting: boolean = false;
  view: any;
  toasterOptions: GlobalConfig;

  constructor(private router: Router,private appservice: AppService, private AppUrl: AppUrl, private services: ApiService, private toastr: ToastrService, private cookieService: CookieService, private authService: AuthService) {
    this.toasterOptions = this.toastr.toastrConfig;
  }

  ngOnInit() {
    this.showLoading = false;
  }
  // API call to fetch user details based on authentication
  login() {
    this.showLoading = true;
    this.services.create(this.AppUrl.getLoginApi('LOGIN'), this.user).subscribe(res => {
      if (!res.status) {
        this.showLoading = false;
       // this.appservice.toast('', 'Invalid credentials entered', 'error', 'error-mode');
       this.appservice.toast('', 'Login failed.Please try again with valid credentials ', 'error', 'error-mode');
 
        return;
      } else {
        if (!res.data.web) {
          this.showLoading = false;
          // this.appservice.toast('', 'Invalid authentication', 'error', 'error-mode');
          this.appservice.toast('', 'Login failed.Please try again with valid credentials ', 'error', 'error-mode');
          return;
        } else {
          this.cookieService.set('token', res.data.token);
          this.cookieService.set('station', res.data.userAirportMappingList[0].id);
         const ap = {
           /* Live */
            //station: res.data.userAirportMappingList[0].id
            /* For ANZ demo */
            station: 81
          }
          const role = (res.data.userRoleMasterList[0].name).toUpperCase();
          console.log(role)
          if ((role === 'NOC') || (role === 'FSC')){

          } else {
            //commented by priya for analytics 
             localStorage.setItem('analyticsParams', JSON.stringify(ap));

          }
          this.authService.setUser(res.data);
          this.cookieService.set('user', JSON.stringify(res.data));
          this.AppUrl.getTimeZone()
          this.authService.navigateUser();
        }
      }
    }, error => {
      console.log("error")
    });
  }
  // custom flag for Input fields UI
  loginSetting() {
    this.setting = true;
  }
}



