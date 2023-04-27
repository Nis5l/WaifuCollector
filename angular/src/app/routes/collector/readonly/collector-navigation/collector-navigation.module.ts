import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CollectorNavigationComponent } from './collector-navigation.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
	imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
	declarations: [ CollectorNavigationComponent ],
  exports: [ CollectorNavigationComponent ]
})
export class CollectorNavigationModule {}
