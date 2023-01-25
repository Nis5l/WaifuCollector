import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { HttpService } from './http.service';
import { AuthModule } from '../auth-service';

@NgModule({
	imports: [ AuthModule, HttpClientModule ],
	providers: [ HttpService ],
	exports: [ HttpClientModule ]
})
export class HttpModule {}

