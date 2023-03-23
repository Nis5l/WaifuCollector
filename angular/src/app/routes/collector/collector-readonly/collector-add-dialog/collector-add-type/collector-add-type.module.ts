import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CollectorAddTypeComponent } from './collector-add-type.component';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		ReactiveFormsModule,
		
		...MATERIAL_MODULES,
	],
	declarations: [ CollectorAddTypeComponent ],
	exports: [ CollectorAddTypeComponent ]
})
export class CollectorAddTypeModule {}
