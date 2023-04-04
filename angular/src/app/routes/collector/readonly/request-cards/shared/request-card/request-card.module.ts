import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { RequestCardComponent } from './request-card.component';
import { UserModule } from '../../../../../../shared/components';
import { UserModule as UserServiceModule } from '../../../../../../shared/services';

const MATERIAL_MODULES = [
	MatCardModule,
	MatButtonModule,
	MatIconModule,
	MatDividerModule
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		UserModule,
		UserServiceModule
	],
	declarations: [ RequestCardComponent ],
	exports: [ RequestCardComponent ]
})
export class RequestCardModule {}
