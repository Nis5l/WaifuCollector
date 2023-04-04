import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf, catchError, map, switchMap, combineLatest as observableCombineLatest } from 'rxjs';

import { LoadingService, AuthService } from '../../../shared/services';
import type { Id } from '../../../shared/types';
import { ProfileService } from '../profile.service';
import type { Profile } from '../shared';

@Component({
	selector: "cc-profile-readonly",
	templateUrl: "./profile-readonly.component.html",
	styleUrls: [ "/profile-readonly.component.scss" ]
})
export class ProfileReadonlyComponent {
	public readonly profile$: Observable<(Profile & { userId: Id }) | null>;
	public readonly canEdit$: Observable<boolean>;

	constructor(
		private readonly profileService: ProfileService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly router: Router,
		private readonly authService: AuthService,
		loadingService: LoadingService,
	) {
		this.profile$ = loadingService.waitFor(activatedRoute.params.pipe(
			map(params => {
				const userId = params["userId"] as unknown;
				if(typeof userId !== "string") {
					throw new Error("userId is not a string");
				}
				return userId;
			}),
			switchMap(userId => this.profileService.getProfile(userId).pipe(
				map(profile => ({ ...profile, userId })),
				catchError(() => observableOf(null)))
			)
		));

		this.canEdit$ = observableCombineLatest([this.profile$, this.authService.authData()]).pipe(
			map(([profile, authData]) => AuthService.userIdEqual(profile?.userId, authData?.userId))
		);
	}

	public edit(): void {
		this.router.navigate(["edit"], { relativeTo: this.activatedRoute });
	}
}
