import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule } from '../../../../../shared/services';
import { NgVarModule } from '../../../../../shared/directives';
import { CollectorAddCardTypeComponent } from './collector-add-card-type.component';
import { CollectorAddCardTypeService } from './collector-add-card-type.service';

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
	providers: [ CollectorAddCardTypeService ],
	declarations: [ CollectorAddCardTypeComponent ],
	exports: [ CollectorAddCardTypeComponent ]
})
export class CollectorAddCardTypeModule {}
