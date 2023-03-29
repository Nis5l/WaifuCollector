import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule } from '../../../../../shared/services';
import { NgVarModule } from '../../../../../shared/directives';
import { CollectorAddTypeComponent } from './collector-add-type.component';
import { CollectorAddTypeService } from './collector-add-type.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		HttpModule,
		NgVarModule,
		
		...MATERIAL_MODULES,
	],
	providers: [ CollectorAddTypeService ],
	declarations: [ CollectorAddTypeComponent ],
	exports: [ CollectorAddTypeComponent ]
})
export class CollectorAddTypeModule {}
