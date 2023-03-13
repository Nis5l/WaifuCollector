import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import { ProfileEditComponent } from './profile-edit.component';
import { ProfileService } from '../profile.service';
import { ProfileImageModule } from '../shared';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		HttpModule,
	 	RouterModule,

		NgVarModule,

		ProfileImageModule,
	],
	declarations: [ ProfileEditComponent ],
	providers: [ ProfileService ],
})
export class ProfileEditModule {}
