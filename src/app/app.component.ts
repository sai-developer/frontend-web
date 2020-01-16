import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { setTheme } from 'ngx-bootstrap/utils';
import { AuthService } from "./service/app.service";
import { CookieService } from "ngx-cookie-service";
import { AppUrl } from "./service/app.url-service";

declare global {
  interface Window { chrome: any; }
}

window.chrome = window.chrome || {};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(translate: TranslateService, private AppUrl: AppUrl, private authService: AuthService, private cookieService: CookieService) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');

    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    setTheme('bs4'); // or 'bs4'

    let user = this.cookieService.get('user');
    if (!!user) {
      this.authService.setUser(JSON.parse(user));
      this.AppUrl.getTimeZone()
      //this.authService.setTimeZone(user.airport.timezone);
    }
    // to check for resolution
    var Mobile = window.orientation > -1;
    Mobile ? this.isMobile() : this.isNotMobile();
    // to check the type of browser
    var isChrome = !!window.chrome && (!!window.chrome.app || !!window.chrome.runtime);
    isChrome ? this.isChrome() : this.isNotChrome();
    this.getChromeVersion();
  }
  viewApp: Boolean = false;
  viewError: Boolean = false;
  isMobile() {
    // document.getElementById("login-panel-body").innerHTML = "<h5>The website you're looking for is not viewable on mobile(yet). Please browse from your desktop.</h5>";
    this.viewError = true;
    this.viewApp = false;
    // console.log('its a mobile')
  }
  isNotMobile() {
    this.viewError = false;
    this.viewApp = true;
    // console.log('not a mobile')
  }
  isChrome(){
    // console.log('is chrome');
  }
  isNotChrome(){
    // console.log('is not chrome');
  }
  getChromeVersion () {     
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    // console.log(raw);
    let version = raw ? parseInt(raw[2], 10) : false;
    // console.log(version);
}
}
