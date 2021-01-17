import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { SingleImageResponse } from '../models/models';
import { Observable } from 'rxjs';
import { ImageGalleryService } from '../services/image-gallery.service';
import { AuthService } from '../services/auth.service';
import { mergeMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SingleImageService implements Resolve<SingleImageResponse> {

  constructor(private imageGalleryService: ImageGalleryService,
              private authService: AuthService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<SingleImageResponse> {
    const id = route.params.id;
    return this.authService.getToken()
      .pipe(
        mergeMap(token => {
          return this.imageGalleryService.getImageDetail(id, token);
        }));
  }
}
