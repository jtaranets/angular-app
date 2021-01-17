import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ImageGalleryService } from '../services/image-gallery.service';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { Image } from '../models/models';
import { Observable } from 'rxjs';
import { ImageViewComponent } from './image-view/image-view.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent implements OnInit, OnDestroy {
  images$: Observable<Image[]>;
  canLoadMore$: Observable<boolean>;
  currentPage = 1;
  @ViewChild(ImageViewComponent, { static: false }) modal: ImageViewComponent;
  @ViewChild('modalImage', { static: false }) modalImage: ElementRef;

  constructor(private imageGalleryService: ImageGalleryService,
              private auth: AuthService,
              private renderer: Renderer2,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const page = this.route.snapshot.queryParamMap.get('page');
    if (page) {
      this.currentPage = parseInt(page, 10);
    }
    this.loadImages();
  }

  openPopup(id): void {
    this.router.navigate([id], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage
      }
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.loadImages();
  }

  private loadImages(): void {
    const page = this.currentPage > 1 ? this.currentPage : undefined;
    this.auth.getToken()
      .pipe(switchMap(response => this.imageGalleryService.getImageResponse(response, page)))
      .subscribe();
    if (page) {
      this.router.navigate([], {
        queryParams: {
          page
        }
      });
    }
    this.images$ = this.imageGalleryService.getImages();
    this.canLoadMore$ = this.imageGalleryService.getLoadMore();
  }

  ngOnDestroy(): void {
  }
}
