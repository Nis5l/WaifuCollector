import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CollectorAddCardComponent } from './collector-add-card.component';
import { HttpModule } from '../../../../../shared/services';
import { CardModule } from '../../../../../shared/components';
import { NgVarModule } from '../../../../../shared/directives';

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
		CardModule,
		NgVarModule,
	],
	declarations: [ CollectorAddCardComponent ],
	exports: [ CollectorAddCardComponent ],
})
export class CollectorAddCardModule {}
