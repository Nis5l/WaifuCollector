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
	ProfileModule,
	HomeModule,
	CollectorModule,
} from './routes';

const MODULES = [
	HeaderModule,
	LoadingModule,

	LoginModule,
	LogoutModule,
	RegisterModule,

	CollectorsModule,
	CollectorModule,
	ProfileModule,
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
