import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth-service';
import { HttpService } from '../../../http-service';

import { BaseComponent } from '../../../base-component';

@Component({
	selector: 'cc-logout',
	template: '',
	styleUrls: [],
})
export class LogoutComponent extends BaseComponent implements OnInit {
	constructor(private readonly authService: AuthService, private readonly httpService: HttpService, private readonly router: Router) { super(); }

	public ngOnInit(): void {
		const logout = () => {
			this.authService.logout();
			this.router.navigate(["login"]);
		};
		this.registerSubscription(
			this.httpService.post("/logout", {}, { withCredentials: true }).subscribe({
				error: logout,
				next: logout
			})
		);
	}
}
