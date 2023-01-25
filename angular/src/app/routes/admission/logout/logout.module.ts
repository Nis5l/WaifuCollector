import { NgModule } from '@angular/core';

import { LogoutComponent } from './logout.component';
import { AuthModule } from '../../../auth-service';

@NgModule({
	imports: [ AuthModule ],
	declarations: [ LogoutComponent ],
})
export class LogoutModule {}
