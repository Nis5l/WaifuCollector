import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgVarModule } from '../../../../shared/directives';

import { CollectorOpenModule } from '../../shared';
import { CollectorDashboardComponent } from './collector-dashboard.component';

@NgModule({
	imports: [
    NgVarModule,

    CommonModule,
    CollectorOpenModule
  ],
	declarations: [ CollectorDashboardComponent ],
  exports: [ CollectorDashboardComponent ]
})
export class CollectorDashboardModule {}
