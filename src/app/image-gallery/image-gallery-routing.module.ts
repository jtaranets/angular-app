import { RouterModule, Routes } from '@angular/router';
import { ImageGalleryComponent } from './image-gallery.component';
import { NgModule } from '@angular/core';
import { ImageViewComponent } from './image-view/image-view.component';
import { SingleImageService } from '../resolvers/single-image.service';

const routes: Routes = [
  {
    path: '',
    component: ImageGalleryComponent,
    children: [
      {
        path: ':id',
        component: ImageViewComponent,
        resolve: {
          image: SingleImageService
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageGalleryRoutingModule {
}
