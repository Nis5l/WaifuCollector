import { NgModule } from '@angular/core';

import { LogoutComponent } from './logout.component';
import { AuthModule } from '../../../auth-service';
import { HttpModule } from '../../../http-service';

@NgModule({
	imports: [
		AuthModule,
		HttpModule,
	],
	declarations: [ LogoutComponent ],
})
export class LogoutModule {}
