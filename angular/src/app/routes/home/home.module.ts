import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { BasicCardModule } from '../../shared/components';

@NgModule({
	imports: [ BasicCardModule ],
	declarations: [ HomeComponent ],
	exports: [ HomeComponent ],
})
export class HomeModule {}
