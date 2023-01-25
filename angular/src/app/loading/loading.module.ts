import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

 import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 

import { LoadingService } from './loading.service';
import { LoadingComponent } from './loading.component';

const MATERIAL_MODULES = [
	MatProgressSpinnerModule,
];

@NgModule({
	imports: [
		CommonModule,
		...MATERIAL_MODULES
	],
	providers: [ LoadingService ],
	declarations: [ LoadingComponent ],
	exports: [ LoadingComponent ],
})
export class LoadingModule {}
