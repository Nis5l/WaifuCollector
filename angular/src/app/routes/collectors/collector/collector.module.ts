import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import { CollectorComponent } from './collector.component';
import { LoadingSpinnerModule } from '../../../loading';
import { CollectorImageModule } from '../../collector';

const MATERIAL_MODULES = [
	MatCardModule
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		LoadingSpinnerModule,
		CollectorImageModule,
	],
	declarations: [ CollectorComponent ],
	exports: [ CollectorComponent ],
})
export class CollectorModule {}
