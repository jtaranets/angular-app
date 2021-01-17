import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_KEY, AUTH_ENDPOINT } from '../constant/constants';
import { Observable, of, throwError } from 'rxjs';
import { AuthResponseModel } from '../models/models';
import { catchError, filter, map, retry, share, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string;

  constructor(private http: HttpClient) {
    this.getSavedToken();
  }

  getToken(): Observable<string> {
    return this.token
      ? of(this.token)
      : this.renewToken();
  }

  renewToken(): Observable<string> {
    return this.http.post<AuthResponseModel>(AUTH_ENDPOINT, { apiKey: API_KEY })
      .pipe(
        filter(res => res.auth),
        map(response => response.token),
        tap((response) => {
          this.handleAuthorization(response);
        }),
        retry(),
        catchError(err => {
          return throwError(err);
        }));
  }


  private handleAuthorization(token): void {
    localStorage.setItem('token', token);
    this.token = token;
  }

  private getSavedToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.token = token;
    }
  }
}
