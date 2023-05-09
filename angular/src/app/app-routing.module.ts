import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
	LoginComponent,
	LogoutComponent,
	CollectorsComponent,
	RegisterComponent,
	ProfileReadonlyComponent,
	ProfileEditComponent,
	HomeComponent,
	CollectorReadonlyComponent,
	CollectorEditComponent,
	CardViewComponent,
} from './routes';

const routes: Routes = [
	{ path: "login", component: LoginComponent },
	{ path: "logout", component: LogoutComponent },
	{ path: "register", component: RegisterComponent },

	{ path: "collectors", component: CollectorsComponent },
	{ path: "collector/:collectorId/edit", component: CollectorEditComponent },
	{ path: "collector/:collectorId", component: CollectorReadonlyComponent, children: CollectorReadonlyComponent.getRoutes() },

	{ path: "user/:userId/edit", component: ProfileEditComponent },
	{ path: "user/:userId", component: ProfileReadonlyComponent },

	{ path: "card/:cardId", component: CardViewComponent },

	{ path: "home", component: HomeComponent },
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
