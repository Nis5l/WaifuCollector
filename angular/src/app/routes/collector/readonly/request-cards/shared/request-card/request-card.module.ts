import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RequestCardComponent } from './request-card.component';
import { UserModule } from '../../../../../../shared/components';

const MATERIAL_MODULES = [
	MatCardModule,
	MatButtonModule,
	MatIconModule
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		UserModule
	],
	declarations: [ RequestCardComponent ],
	exports: [ RequestCardComponent ]
})
export class RequestCardModule {}
