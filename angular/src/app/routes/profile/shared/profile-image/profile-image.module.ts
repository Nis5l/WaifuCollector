import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HttpModule, AuthModule, LoadingModule } from '../../../../shared/services';
import { ImageCircleModule } from '../../../../shared/components';
import { ProfileImageComponent } from './profile-image.component';
import { ProfileImageService } from './profile-image.service';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		AuthModule,
		LoadingModule,
		ImageCircleModule,
		HttpModule,
	],
	providers: [ ProfileImageService ],
	declarations: [ ProfileImageComponent ],
	exports: [ ProfileImageComponent ],
})
export class ProfileImageModule {}
