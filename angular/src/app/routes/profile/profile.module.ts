import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../../http-service';
import { NgVarModule } from '../../directives';
import { ProfileComponent } from './profile.component';
import { ProfileService } from './profile.service';
import { ProfileImageModule } from './profile-image';

@NgModule({
	imports: [
		CommonModule,

		HttpModule,
	 	RouterModule,

		NgVarModule,

		ProfileImageModule,
	],
	declarations: [ ProfileComponent ],
	providers: [ ProfileService ],
})
export class ProfileModule {}
