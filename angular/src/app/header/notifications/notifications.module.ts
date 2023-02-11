import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgVarModule } from '../../directives';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon'; 

import { HttpModule } from '../../http-service';

import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';

const MATERIAL_MODULES = [
	MatBadgeModule,
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,

		...MATERIAL_MODULES,
	
		HttpModule,
		NgVarModule
	],
	providers: [ NotificationsService ],
	declarations: [ NotificationsComponent ],
	exports: [ NotificationsComponent ],
})
export class NotificationsModule {}
