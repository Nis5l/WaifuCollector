import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderModule } from './header';
import { LoadingModule } from './loading';
import {
	LoginModule,
	LogoutModule,
	CollectorsModule,
	RegisterModule,
	ProfileModule,
	HomeModule,
} from './routes';

const MODULES = [
	HeaderModule,
	LoadingModule,

	LoginModule,
	LogoutModule,
	RegisterModule,

	CollectorsModule,
	ProfileModule,
	HomeModule,
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
