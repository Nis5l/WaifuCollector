import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../../../../shared/services';
import { CollectorFavoritesComponent } from './collector-favorites.component';
import { CollectorFavoritesService } from './collector-favorites.service';
import { CollectorCardModule } from '../../../../shared/components';
import { NgVarModule } from '../../../../shared/directives';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,

    CollectorCardModule,
    HttpModule,
    NgVarModule,
  ],
  providers: [ CollectorFavoritesService ],
  declarations: [ CollectorFavoritesComponent ],
  exports: [ CollectorFavoritesComponent ],
})
export class CollectorFavoritesModule { }
