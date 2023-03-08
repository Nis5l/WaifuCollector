import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgVarModule } from '../../directives';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon'; 

import { PopupModule } from '../../popup';
import { HttpModule } from '../../http-service';

import { NotificationItemComponent } from './notification-item';
import { NotificationsListComponent } from './notifications-list';
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
		NgVarModule,
		PopupModule
	],
	providers: [ NotificationsService ],
	declarations: [ NotificationsComponent, NotificationsListComponent, NotificationItemComponent ],
	exports: [ NotificationsComponent ],
})
export class NotificationsModule {}
