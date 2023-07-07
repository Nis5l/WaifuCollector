import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderModule } from './header';
import { LoadingModule, PopupModule } from './shared/services';
import {
	LoginModule,
	LogoutModule,
	CollectorsModule,
	RegisterModule,
	ProfileReadonlyModule,
	ProfileEditModule,
	HomeModule,
	CollectorReadonlyModule,
	CollectorEditModule,
	CardViewModule,
  CardUpgradeModule,
  UsersModule,
} from './routes';

const MODULES = [
	HeaderModule,
	LoadingModule,

	LoginModule,
	LogoutModule,
	RegisterModule,

	CollectorsModule,
	CollectorReadonlyModule,
	CollectorEditModule,
	ProfileReadonlyModule,
	ProfileEditModule,
	HomeModule,
	PopupModule,
	CardViewModule,
  CardUpgradeModule,
  UsersModule,
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
	BrowserAnimationsModule,

	...MODULES
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
