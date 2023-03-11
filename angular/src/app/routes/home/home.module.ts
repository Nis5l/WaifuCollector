import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { BasicCardModule } from '../../components/basic-card';

@NgModule({
	imports: [ BasicCardModule ],
	declarations: [ HomeComponent ],
	exports: [ HomeComponent ],
})
export class HomeModule {}
