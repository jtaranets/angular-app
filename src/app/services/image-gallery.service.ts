import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { IMAGES_ENDPOINT } from '../constant/constants';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Image, ImageResponse, SingleImageResponse } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ImageGalleryService {

  private imagesResponse$: BehaviorSubject<ImageResponse> = new BehaviorSubject({} as ImageResponse);
  allImages: string[] = [];

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  private static getHeaders(token): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getImageResponse(token: string, page?): Observable<ImageResponse> {
    return this.http.get<ImageResponse>(IMAGES_ENDPOINT, {
      headers: ImageGalleryService.getHeaders(token),
      ...(page && { params: { page } })
    })
      .pipe(tap(r => {
          this.imagesResponse$.next(r);
          this.allImages = r.pictures.map(p => p.id);
        }),
        catchError((err) => this.handleError(err, (newToken) => this.getImageResponse(newToken, page))));
  }

  getImages(): Observable<Image[]> {
    return this.imagesResponse$
      .pipe(map(response => response.pictures));
  }

  getLoadMore(): Observable<boolean> {
    return this.imagesResponse$
      .pipe(map(response => response.hasMore));
  }

  getCurrentImageIndex(id: string): Observable<number> {
    return this.imagesResponse$
      .pipe(map(response => {
        if (response.pictures) {
          return response.pictures.findIndex(p => p.id === id);
        }
      }));
  }

  getImageDetail(id: string, token: string): Observable<SingleImageResponse> {
    return this.http.get<SingleImageResponse>(`${IMAGES_ENDPOINT}/${id}`, { headers: ImageGalleryService.getHeaders(token) })
      .pipe(catchError((err) => this.handleError(err, (newToken) => this.getImageDetail(id, newToken))));
  }

  handleError(err: HttpErrorResponse, cb): Observable<any> {
    if (err.status === 401) {
      return this.authService.renewToken()
        .pipe(switchMap(token => cb(token)));
    }
    return throwError(err);
  }
}
