import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth-service';
import { HttpService } from '../../../http-service';

@Component({
	selector: 'cc-logout',
	template: '',
	styleUrls: [],
})
export class LogoutComponent implements OnInit {
	constructor(private readonly authService: AuthService, private readonly httpService: HttpService, private readonly router: Router) {}

	public ngOnInit(): void {
		this.httpService.post("/logout", {}, { withCredentials: true }).subscribe(() => {
			this.authService.logout();
			this.router.navigate(["login"]);
		});
	}
}
