import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CollectorEditComponent } from './collector-edit.component';
import { CollectorService } from '../collector.service';
import { HttpModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import {
	CollectorImageModule,
	CollectorFavoriteModule,
	CollectorBannerModule,
	CollectorOpenModule
} from '../shared';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		RouterModule,
			
		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,
		NgVarModule
	],
	providers: [ CollectorService ],
	declarations: [ CollectorEditComponent ],
})
export class CollectorEditModule {}
