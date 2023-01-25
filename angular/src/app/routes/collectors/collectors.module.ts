import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpModule } from '../../http-service';
import { CollectorModule } from './collector';

import { CollectorsComponent } from './collectors.component';
import { CollectorsService } from './collectors.service';

@NgModule({
	imports: [
		CommonModule,

		HttpModule,
		CollectorModule
	],
	providers: [ CollectorsService ],
	declarations: [ CollectorsComponent ],
})
export class CollectorsModule {}
