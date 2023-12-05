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
  CardUpgradeComponent,
  UsersComponent,
  ProfileReadonlyTradeComponent,
} from './routes';
import { canActivateAuth, canActivateCollectorAdmin } from './shared/guards';

const routes: Routes = [
	{ path: "login", component: LoginComponent },
	{ path: "logout", component: LogoutComponent, canActivate: [ canActivateAuth ] },
	{ path: "register", component: RegisterComponent },

	{ path: "collectors", component: CollectorsComponent },
	{ path: "collector/:collectorId/edit", component: CollectorEditComponent, canActivate: [ canActivateAuth, canActivateCollectorAdmin ] },
	{ path: "collector/:collectorId", component: CollectorReadonlyComponent, children: CollectorReadonlyComponent.getRoutes() },

	{ path: "user/:userId/edit", component: ProfileEditComponent, canActivate: [ canActivateAuth ] },
	{ path: "user/:userId", component: ProfileReadonlyComponent, children: ProfileReadonlyComponent.getRoutes() },
	{ path: "user/:userId/trade/:collectorId", component: ProfileReadonlyTradeComponent },

	{ path: "card/:cardId", component: CardViewComponent },
	{ path: "card/:cardId/upgrade", component: CardUpgradeComponent },

	{ path: "home", component: HomeComponent },
	{ path: "users", component: UsersComponent },
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
