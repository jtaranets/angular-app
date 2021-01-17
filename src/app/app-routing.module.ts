import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'image-gallery',
    pathMatch: 'full'
  },
  {
    path: 'image-gallery',
    loadChildren: () => import('./image-gallery/image-gallery.module').then(m => m.ImageGalleryModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
