import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule } from '../../http-service';
import { LoadingSpinnerModule } from '../../loading';
import { CollectorModule } from './collector';

import { CollectorsComponent } from './collectors.component';
import { CollectorsService } from './collectors.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		HttpModule,
		CollectorModule,
		LoadingSpinnerModule,
	],
	providers: [ CollectorsService ],
	declarations: [ CollectorsComponent ],
})
export class CollectorsModule {}
