import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpModule } from '../../../shared/services';
import { NgVarModule } from '../../../shared/directives';
import { ProfileReadonlyComponent } from './profile-readonly.component';
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
	declarations: [ ProfileReadonlyComponent ],
	providers: [ ProfileService ],
})
export class ProfileReadonlyModule {}