import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import { CollectorComponent } from './collector.component';
import { LoadingSpinnerModule } from '../../../loading';
import { CollectorImageModule } from './collector-image';
import { CollectorFavoriteModule } from './collector-favorite';

const MATERIAL_MODULES = [
	MatCardModule
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		LoadingSpinnerModule,
		CollectorImageModule,
		CollectorFavoriteModule
	],
	declarations: [ CollectorComponent ],
	exports: [ CollectorComponent ],
})
export class CollectorModule {}
