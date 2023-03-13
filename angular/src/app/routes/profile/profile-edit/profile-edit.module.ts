import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import { ProfileEditComponent } from './profile-edit.component';
import { ProfileService } from '../profile.service';
import { ProfileImageModule } from '../shared';

@NgModule({
	imports: [
		CommonModule,

		HttpModule,
	 	RouterModule,

		NgVarModule,

		ProfileImageModule,
	],
	declarations: [ ProfileEditComponent ],
	providers: [ ProfileService ],
})
export class ProfileEditModule {}
