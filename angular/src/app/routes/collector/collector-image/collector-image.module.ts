import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CollectorImageComponent } from './collector-image.component';
import { CollectorImageService } from './collector-image.service';
import { HttpModule } from '../../../http-service';
import { AuthModule } from '../../../auth-service';
import { ImageCircleModule } from '../../../components/image-circle';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
	imports: [
		CommonModule,

		...MATERIAL_MODULES,

		HttpModule,
		AuthModule,
		ImageCircleModule
	],
	providers: [ CollectorImageService ],
	declarations: [ CollectorImageComponent ],
	exports: [ CollectorImageComponent ],
})
export class CollectorImageModule {}
