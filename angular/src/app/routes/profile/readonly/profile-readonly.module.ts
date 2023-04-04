import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule, AuthModule } from '../../../shared/services';
import { ProfileImageModule } from '../../../shared/components';
import { NgVarModule } from '../../../shared/directives';
import { ProfileReadonlyComponent } from './profile-readonly.component';
import { ProfileService } from '../profile.service';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,
	 	RouterModule,

		...MATERIAL_MODULES,

		HttpModule,
		AuthModule,
		NgVarModule,

		ProfileImageModule,
	],
	declarations: [ ProfileReadonlyComponent ],
	providers: [ ProfileService ],
})
export class ProfileReadonlyModule {}
