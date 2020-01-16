import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { AuthService, AppService } from "./app.service";

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this.cookieService.get('token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }
}

@Injectable()
export class AppInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      catchError(error => {
        // console.log(error)
        if (error.status === 401) {
          // this.authService.logout();
        }
        if (error.name === 'HttpErrorResponse') {
          // console.log("Service Unavailable")
        }

        return Observable.throw(error);
      })
    )
  }
}


@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private appService: AppService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {



    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (req.url.indexOf('/getShiftsTZ') !== -1 || req.url.indexOf('/getUsers') !== -1 || req.url.indexOf('/getFlightScheduleDetails') !== -1
        || req.url.indexOf('/getTaskScheduleList') !== -1 || req.url.indexOf('/delayTaskMapping') !== -1 || req.url.indexOf('/getBayMasterList') !== -1 
        || req.url.indexOf('/getEquipmentMasterByGroup') !== -1){
          if (event.body.data) {
            console.log(event.body.data)
          }
        }
      }
    },
      (err: any) => {
        console.log(err)
      }));
  }
}