import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileImageComponent } from './profile-image.component';
import { ProfileImageService } from './profile-image.service';
import { HttpModule } from '../../../http-service';

@NgModule({
	imports: [ HttpModule, CommonModule ],
	providers: [ ProfileImageService ],
	declarations: [ ProfileImageComponent ],
	exports: [ ProfileImageComponent ],
})
export class ProfileImageModule {}
