import { NgModule } from '@angular/core';
import { ImageGalleryComponent } from './image-gallery.component';
import { HttpClientModule } from '@angular/common/http';
import { ImageGalleryRoutingModule } from './image-gallery-routing.module';
import { CommonModule } from '@angular/common';
import { ImageViewComponent } from './image-view/image-view.component';

@NgModule({
  declarations: [
    ImageGalleryComponent,
    ImageViewComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ImageGalleryRoutingModule
  ],
  providers: [],
})
export class ImageGalleryModule { }
