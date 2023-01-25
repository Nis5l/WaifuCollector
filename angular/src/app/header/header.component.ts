import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';

import { AuthService } from '../auth-service';
import { UserService } from '../user-service';
import { LoadingService } from '../loading';

@Component({
  selector: 'cc-header',
  templateUrl: './header.component.html',
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent {
	private readonly toggleSidebarSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

	public readonly toggleSidebar$: Observable<boolean>;
	public readonly loggedIn$: Observable<boolean>;
	public readonly username$: Observable<string | null>;

	constructor(
		public readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly router: Router,
		private readonly loadingService: LoadingService,
	) {
		this.loggedIn$ = this.authService.loggedIn();
		this.toggleSidebar$ = combineLatest([this.toggleSidebarSubject.asObservable(), this.loggedIn$]).pipe(
			map(([toggled, loggedIn]: [boolean, boolean]): boolean => toggled && loggedIn)
		);
		this.username$ = this.loadingService.waitFor(this.userService.getUsername());
	}

	public toggleSidebar(): void {
		this.toggleSidebarSubject.next(!this.toggleSidebarSubject.getValue());
	}

	public navigateProfile(): void {
		const userId = this.authService.getUserId();
		this.router.navigate(userId == null ? ["logout"]  :[`user/${userId}`]);
	}
}
