import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AngularResizeEventModule } from 'angular-resize-event';

import { CollectorNavigationComponent } from './collector-navigation.component';

@NgModule({
	imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    AngularResizeEventModule
  ],
	declarations: [ CollectorNavigationComponent ],
  exports: [ CollectorNavigationComponent ]
})
export class CollectorNavigationModule {}
