import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { NewCollectorDialogService } from './new-collector-dialog.service';
import { NewCollectorDialogComponent } from './new-collector-dialog.component';
import { CollectorImageModule } from '../collector';
import { ImageCircleModule } from '../../../components/image-circle';
import { LoadingModule, LoadingSpinnerModule } from '../../../loading';
import { NgVarModule } from '../../../directives';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		CollectorImageModule,
		LoadingModule,
		LoadingSpinnerModule,
		ImageCircleModule,
		NgVarModule,
	],
	providers: [ NewCollectorDialogService ],
	declarations: [ NewCollectorDialogComponent ],
})
export class NewCollectorDialogModule {}
