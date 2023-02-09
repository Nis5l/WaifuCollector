import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
	LoginComponent,
	LogoutComponent,
	CollectorsComponent,
	RegisterComponent,
	ProfileComponent,
	HomeComponent,
	CollectorComponent,
} from './routes';

const routes: Routes = [
	{ path: "login", component: LoginComponent },
	{ path: "logout", component: LogoutComponent },
	{ path: "register", component: RegisterComponent },

	{ path: "collectors", component: CollectorsComponent },
	{ path: "collector/:collectorId", component: CollectorComponent },
	{ path: "home", component: HomeComponent },

	{ path: "user/:userId", component: ProfileComponent },
];

@NgModule({
  imports: [
	  RouterModule.forRoot(routes),
  ],
  exports: [
	  RouterModule
  ]
})
export class AppRoutingModule { }
