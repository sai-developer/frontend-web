import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { FlexLayoutModule } from '@angular/flex-layout';

import { DemoMaterialModule } from './shared/demo.module';

import {MatSidenavModule} from '@angular/material/sidenav';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatFormFieldModule, MatSelectModule} from '@angular/material';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';

import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { ToastrModule } from 'ngx-toastr';
import { NgxUploaderModule } from 'ngx-uploader';
import { CookieService } from 'ngx-cookie-service';
import { NgDragDropModule } from 'ng-drag-drop';

import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';
// import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { StationLayoutComponent } from './layouts/station/station-layout.component';
import { AnalyticsModule } from './analytics/analytics.module';

import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { SharedModule } from './shared/shared.module';
import {ToastComponent} from "./toast/toast.component";
import {AlertComponent} from "./alert/alert.component";
import {FormBuilder, FormGroup} from '@angular/forms';

import {environment} from '../environments/environment';
import { ApiService } from './service/app.api-service';
import {ExcelService} from './service/excel-service';
import { AppUrl } from './service/app.url-service';
import {AppService, AuthService, TaskService} from "./service/app.service";
import {AppMessages} from "./service/app.messages";
import {AppRoutingService} from './service/app.service';
import {AppInterceptor, HeaderInterceptor, LoaderInterceptor,} from './service/app.interceptor';
import {RemoveMenuItem} from './service/app.pipe';
import {TaskBG,flightColor,TemflightColor,TaskStatusLogic,SortValues, ParseValues} from "./service/app.pipe";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { Observable } from 'rxjs';
import {MatSliderModule} from '@angular/material/slider';
import {CommonData} from "./service/common-data";
import {MapStyleJson} from "./service/map-style";
import {MatStepperModule} from '@angular/material/stepper';
import { UserIdleModule } from 'angular-user-idle';
let d = new Date();
let date = d.getTime();
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions
} from 'ngx-mqtt';
import { FinalApproachComponent } from './layouts/station/final-approach/final-approach.component';
console.log(environment.baseurl);
localStorage.removeItem('userTime');
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: environment.mqttHost,
  port: environment.mqttPort,
  username:'backend',
  password:'backend',
  path: '/mqtt',
  protocol:'wss',
  clientId:'web_'+date.toString(),
  clean:true
};


export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    // AdminLayoutComponent,
    AuthLayoutComponent,
    StationLayoutComponent,
    ToastComponent,
    AlertComponent,
    RemoveMenuItem,
    TaskBG,
    flightColor,
    TemflightColor,
    TaskStatusLogic,
    SortValues, ParseValues, FinalApproachComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    RouterModule.forRoot(AppRoutes, {useHash: true, onSameUrlNavigation: 'reload'}),
    UserIdleModule.forRoot({idle: 60, timeout: 2, ping: 10}),
    FormsModule,
    HttpModule,
    MatSidenavModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatExpansionModule,
    MatToolbarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    DemoMaterialModule,
    MatStepperModule,
    AnalyticsModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    FlexLayoutModule,
    RoundProgressModule,
    HttpClientModule,
    MatDialogModule,
    NgxUploaderModule,
    ToastrModule.forRoot(),
    NgDragDropModule.forRoot(),
    MatTooltipModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatBottomSheetModule
  ],
  providers: [
    {
       provide: PERFECT_SCROLLBAR_CONFIG,
       useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    ApiService,
    ExcelService,
    AppUrl,
    AppService,
    AppMessages,
    AuthService,
    TaskService,
    AppRoutingService,
    CookieService,
    FormBuilder,
    CommonData,
    MapStyleJson
  ],
  entryComponents: [
    ToastComponent,
    AlertComponent,
    FinalApproachComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
