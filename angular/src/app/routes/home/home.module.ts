import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { CardModule } from '../../card';

@NgModule({
	imports: [ CardModule ],
	declarations: [ HomeComponent ],
	exports: [ HomeComponent ],
})
export class HomeModule {}
