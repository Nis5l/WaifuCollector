import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf, catchError, map, switchMap } from 'rxjs';

import { LoadingService } from '../../../shared/services';
import type { Id } from '../../../shared/types';
import { ProfileService } from '../profile.service';
import type { Profile } from '../shared';

import { SubscriptionManagerComponent } from '../../../shared/abstract';

@Component({
	selector: "cc-profile-edit",
	templateUrl: "./profile-edit.component.html",
	styleUrls: [ "/profile-edit.component.scss" ]
})
export class ProfileEditComponent extends SubscriptionManagerComponent {
	public profile$: Observable<(Profile & { userId: Id }) | null> = observableOf(null);

	constructor(
		private readonly profileService: ProfileService,
		loadingService: LoadingService,
		activatedRoute: ActivatedRoute
	) {
		super();
		loadingService.setLoading(true);
		this.profile$ = loadingService.waitFor(activatedRoute.params.pipe(
			map(params => {
				const userId = params["userId"] as unknown;
				if(typeof userId !== "string") {
					loadingService.setLoading(false);
					throw new Error("userId is not a string");
				}
				return userId;
			}),
			switchMap(userId => this.profileService.getProfile(userId).pipe(
				map(profile => ({ ...profile, userId })),
				catchError(() => observableOf(null)))
			)
		));
	}
}
