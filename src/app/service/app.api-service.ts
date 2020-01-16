import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable()
export class ApiService {

    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    };

    extractData(res: Response) {
        return res || {};
    }

    getAll(apiUrl): Observable < any > {
        return this.http.get(apiUrl, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
    }

    getById(apiUrl, id: string): Observable < any > {
        const url = `${apiUrl}${id}`;
        return this.http.get(url, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
    }

    create(apiUrl, data): Observable < any > {
        console.log(data)
        return this.http.post(apiUrl, data, httpOptions).pipe(catchError(this.handleError));
    }

    update(apiUrl, data): Observable < any > {
        return this.http.put(apiUrl, data, httpOptions).pipe(catchError(this.handleError));
    }

    delete(apiUrl, id: string): Observable < {} > {
        const url = `${apiUrl}/${id}`;
        return this.http.delete(url, httpOptions).pipe(catchError(this.handleError));
    }

}
