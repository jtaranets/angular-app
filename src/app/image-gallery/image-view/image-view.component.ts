import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SingleImageResponse } from '../../models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { ImageGalleryService } from '../../services/image-gallery.service';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss']
})
export class ImageViewComponent implements OnInit, AfterViewInit, OnDestroy {
  image$: Observable<SingleImageResponse>;
  unsubscribe$: Subject<void> = new Subject<void>();
  page: string;
  currentImageIndex: number;
  zoomValues = {
    min: 0.5,
    max: 3,
    zoomStep: 10,
    currentValue: 1
  };
  positionValues = {
    x: 0,
    y: 0,
    imageX: 0,
    imageY: 0
  };
  @ViewChild('modal') modal: ElementRef;
  @ViewChild('modalImage') modalImage: ElementRef;
  unlistenCloseModalClick = () => {};
  unlistenMouseUp = () => {};
  unlistenMouseMove = () => {};

  constructor(private renderer: Renderer2,
              private route: ActivatedRoute,
              private router: Router,
              public imageGalleryService: ImageGalleryService) {
    this.closeModal = this.closeModal.bind(this);
    this.finishMovingImage = this.finishMovingImage.bind(this);
    this.moveImage = this.moveImage.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.previousClick = this.previousClick.bind(this);
  }

  ngOnInit(): void {
    this.page = this.route.snapshot.queryParamMap.get('page');
    this.image$ = this.route.data.pipe(map(data => data.image)) as Observable<SingleImageResponse>;
    this.route.params.pipe(mergeMap(r => this.imageGalleryService.getCurrentImageIndex(r.id)))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(ind => this.currentImageIndex = ind);
  }

  ngAfterViewInit(): void {
    this.unlistenCloseModalClick = this.renderer.listen(document.body, 'click', this.closeModal);
    const { width } = this.modalImage.nativeElement.getBoundingClientRect();
    this.zoomValues.currentValue = width;
    this.zoomValues.max = width * 2;
    this.zoomValues.min = width / 2;
  }

  ngOnDestroy(): void {
    this.unlistenCloseModalClick();
    this.unsubscribe$.next();
    this.unlistenMouseMove();
    this.unlistenMouseUp();
  }

  nextClick(e: MouseEvent): void {
    e.stopPropagation();
    this.router.navigate(['image-gallery', this.imageGalleryService.allImages[this.currentImageIndex + 1]],
      { queryParams: { page: this.page } });
  }

  previousClick(e: MouseEvent): void {
    e.stopPropagation();
    this.router.navigate(['image-gallery', this.imageGalleryService.allImages[this.currentImageIndex - 1]],
      { queryParams: { page: this.page } });
  }

  @HostListener('mousewheel', ['$event'])
  private onZoom(e: WheelEvent): void {
    e.preventDefault();
    if (e.deltaY > 0) {
      this.zoomValues.currentValue = this.zoomValues.currentValue >= this.zoomValues.max
        ? this.zoomValues.currentValue
        : this.zoomValues.currentValue + this.zoomValues.zoomStep;
    } else {
      this.zoomValues.currentValue = this.zoomValues.currentValue <= this.zoomValues.min
        ? this.zoomValues.currentValue
        : this.zoomValues.currentValue - this.zoomValues.zoomStep;
    }
    this.renderer.setStyle(this.modal.nativeElement, 'width', `${this.zoomValues.currentValue}px`);
  }

  startMovingImage(e: MouseEvent): void {
    this.getCurrentImageCoords();
    this.unlistenCloseModalClick();
    const { clientX, clientY } = e;
    this.positionValues.x = clientX;
    this.positionValues.y = clientY;
    this.renderer.setStyle(document.body, 'user-select', 'none');
    this.unlistenMouseMove = this.renderer.listen(document.body, 'mousemove', this.moveImage);
  }

  moveImage(): void {
    this.unlistenMouseMove();
    this.unlistenMouseUp = this.renderer.listen(document.body, 'mouseup', this.finishMovingImage);
  }

  finishMovingImage(ev: MouseEvent): void {
    this.unlistenMouseUp();
    const { clientX, clientY } = ev;
    this.positionValues.x = clientX - this.positionValues.x;
    this.positionValues.y = clientY - this.positionValues.y;
    this.renderer.setStyle(this.modal.nativeElement, 'top', `${this.positionValues.imageY + this.positionValues.y}px`);
    this.renderer.setStyle(this.modal.nativeElement, 'left', `${this.positionValues.imageX + this.positionValues.x}px`);
    this.renderer.setStyle(this.modal.nativeElement, 'transform', 'translate(0px, 0px)');
    this.renderer.setStyle(document.body, 'user-select', 'auto');
    setTimeout(() => {
      this.getCurrentImageCoords();
      this.unlistenCloseModalClick = this.renderer.listen(document.body, 'click', this.closeModal);
    }, 300);
  }

  closeModal({ target }): void {
    if (this.modal && !this.modal.nativeElement.contains(target)) {
      this.router.navigate(['image-gallery'], { queryParams: { page: this.page } });
    }
  }

  copyLink(): void {
    const textarea = this.renderer.createElement('textarea');
    const text = this.renderer.createText(location.href);
    this.renderer.appendChild(textarea, text);
    this.renderer.appendChild(this.modal.nativeElement, textarea);
    textarea.select();
    document.execCommand('copy');
    this.renderer.removeChild(this.modal.nativeElement, textarea);
  }

  getCurrentImageCoords(): void {
    const { x, y } = this.modalImage.nativeElement.getBoundingClientRect();
    this.positionValues.imageX = x;
    this.positionValues.imageY = y;
  }
}
