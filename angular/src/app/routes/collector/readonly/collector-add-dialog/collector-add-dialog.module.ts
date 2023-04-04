import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs'; 

import { CollectorAddCardModule } from './collector-add-card';
import { CollectorAddTypeModule } from './collector-add-type';
import { CollectorAddDialogComponent } from './collector-add-dialog.component';

const MATERIAL_MODULES = [
	MatTabsModule,
];

@NgModule({
	imports: [
		CollectorAddCardModule,
		CollectorAddTypeModule,

		...MATERIAL_MODULES,
	],
	declarations: [ CollectorAddDialogComponent ],
})
export class CollectorAddDialogModule {}
