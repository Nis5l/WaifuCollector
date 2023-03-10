import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProfileImageComponent } from './profile-image.component';
import { ProfileImageService } from './profile-image.service';
import { LoadingModule } from '../../../../loading';
import { HttpModule } from '../../../../http-service';
import { AuthModule } from '../../../../auth-service';
import { ImageCircleModule } from '../../../../components/image-circle';

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
