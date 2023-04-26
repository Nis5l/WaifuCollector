import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectorOpenModule } from '../../shared';
import { CollectorDashboardComponent } from './collector-dashboard.component';

@NgModule({
	imports: [
    CommonModule,
    CollectorOpenModule
  ],
	declarations: [ CollectorDashboardComponent ],
  exports: [ CollectorDashboardComponent ]
})
export class CollectorDashboardModule {}
