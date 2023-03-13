import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog'; 

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule } from '../../shared/services';
import { LoadingSpinnerModule } from '../../shared/services/loading';
import { CollectorModule } from './collector';
import { NewCollectorDialogModule } from './new-collector-dialog';

import { CollectorsComponent } from './collectors.component';
import { CollectorsService } from './collectors.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
	MatDialogModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		HttpModule,
		CollectorModule,
		LoadingSpinnerModule,
		NewCollectorDialogModule,
	],
	providers: [ CollectorsService ],
	declarations: [ CollectorsComponent ],
})
export class CollectorsModule {}
