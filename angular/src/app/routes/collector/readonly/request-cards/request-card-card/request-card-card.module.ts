import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestCardTypeComponent } from './request-card-type.component';
import { RequestCardModule } from '../shared';

@NgModule({
	imports: [
		CommonModule,

		RequestCardModule,
	],
	declarations: [ RequestCardTypeComponent ],
	exports: [ RequestCardTypeComponent ]
})
export class RequestCardTypeModule {}
