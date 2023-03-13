import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CollectorReadonlyComponent } from './collector-readonly.component';
import { CollectorService } from '../collector.service';
import { HttpModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import {
	CollectorImageModule,
	CollectorFavoriteModule,
	CollectorBannerModule,
	CollectorOpenModule
} from '../shared';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		RouterModule,

		...MATERIAL_MODULES,
			
		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,
		NgVarModule
	],
	providers: [ CollectorService ],
	declarations: [ CollectorReadonlyComponent ],
})
export class CollectorReadonlyModule {}