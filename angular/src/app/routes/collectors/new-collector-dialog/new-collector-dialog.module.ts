import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { NewCollectorDialogService } from './new-collector-dialog.service';
import { NewCollectorDialogComponent } from './new-collector-dialog.component';
import { CollectorImageModule } from '../collector';
import { ImageCircleModule } from '../../../components/image-circle';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		CollectorImageModule,
		ImageCircleModule,
	],
	providers: [ NewCollectorDialogService ],
	declarations: [ NewCollectorDialogComponent ],
})
export class NewCollectorDialogModule {}
