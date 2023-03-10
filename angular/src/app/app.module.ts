//TODO: implement some sort of abstract subscription service, bevause every subscription has to be unsubscribed on ngDestroy to avoid memory leaks
//example: this.registerSubscription(test.subscrbe(x => console.log(x))); now the subscription should automatically be unsubscribed on destroy

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { PopupModule } from './popup';
import { HeaderModule } from './header';
import { LoadingModule } from './loading';
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
	PopupModule
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
