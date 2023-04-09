import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestCardTypeComponent } from './request-card-type.component';
import { RequestCardTypeService } from './request-card-type.service';
import { RequestCardModule } from '../shared';
import { HttpModule } from '../../../../../shared/services';

@NgModule({
	imports: [
		CommonModule,

		HttpModule,

		RequestCardModule,
	],
	providers: [ RequestCardTypeService ],
	declarations: [ RequestCardTypeComponent ],
	exports: [ RequestCardTypeComponent ]
})
export class RequestCardTypeModule {}
