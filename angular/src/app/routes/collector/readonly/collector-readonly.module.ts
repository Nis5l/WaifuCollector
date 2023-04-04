import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import { CollectorReadonlyComponent } from './collector-readonly.component';
import { CollectorReadonlyService } from './collector-readonly.service';
import { CollectorService } from '../collector.service';
import { RequestCardTypeModule } from './request-cards';
import { HttpModule, AuthModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import {
	CollectorImageModule,
	CollectorFavoriteModule,
	CollectorBannerModule,
	CollectorOpenModule
} from '../shared';
import { CollectorAddDialogModule } from './collector-add-dialog';
import { MatDialogModule } from '@angular/material/dialog';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
	MatTabsModule,
	MatDialogModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,

		...MATERIAL_MODULES,

		HttpModule,
		AuthModule,
		NgVarModule,
			
		CollectorImageModule,
		CollectorFavoriteModule,
		CollectorBannerModule,
		CollectorOpenModule,
		CollectorAddDialogModule,
		RequestCardTypeModule,
	],
	providers: [ CollectorService, CollectorReadonlyService ],
	declarations: [ CollectorReadonlyComponent ],
})
export class CollectorReadonlyModule {}
