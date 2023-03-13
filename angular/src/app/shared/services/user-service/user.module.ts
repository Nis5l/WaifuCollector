import { NgModule } from '@angular/core';

import { HttpModule } from '../http-service';
import { AuthModule  } from '../auth-service';
import { UserService } from './user.service';

@NgModule({
	imports: [ HttpModule, AuthModule ],
	providers: [ UserService ]
})
export class UserModule {}
