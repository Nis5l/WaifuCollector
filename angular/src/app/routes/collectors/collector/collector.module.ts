import { NgModule } from '@angular/core';

import { MatCardModule } from '@angular/material/card';

import { CollectorComponent } from './collector.component';

const MATERIAL_MODULES = [
	MatCardModule
];

@NgModule({
	imports: [
		...MATERIAL_MODULES
	],
	declarations: [ CollectorComponent ],
	exports: [ CollectorComponent ],
})
export class CollectorModule {}
