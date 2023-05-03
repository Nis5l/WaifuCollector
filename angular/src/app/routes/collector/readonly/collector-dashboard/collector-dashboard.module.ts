import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgVarModule } from '../../../../shared/directives';

import { CollectorOpenModule } from '../../shared';
import { CollectorDashboardComponent } from './collector-dashboard.component';

@NgModule({
	imports: [
		CommonModule,

		NgVarModule,
		CollectorOpenModule,
	],
	declarations: [ CollectorDashboardComponent ],
  exports: [ CollectorDashboardComponent ]
})
export class CollectorDashboardModule {}
