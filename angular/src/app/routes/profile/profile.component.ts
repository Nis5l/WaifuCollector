import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf, catchError, map } from 'rxjs';

import { ProfileService } from './profile.service';
import { LoadingService } from '../../loading';
import type { Profile } from './types';
import type { Id } from '../../types';

@Component({
	selector: "cc-profile",
	templateUrl: "./profile.component.html",
	styleUrls: [ "/profile.component.scss" ]
})
export class ProfileComponent {
	public profile$: Observable<(Profile & { userId: Id }) | null> = observableOf(null);

	constructor(
		private readonly profileService: ProfileService,
		loadingService: LoadingService,
		activatedRoute: ActivatedRoute
	) {

		loadingService.setLoading(true);
		activatedRoute.params.subscribe(params => {
			const userId = params["userId"] as unknown;
			if(typeof userId !== "string") {
				loadingService.setLoading(false);
				return;
			}
			this.profile$ = loadingService.waitFor(this.profileService.getProfile(userId).pipe(
				map(profile => ({ ...profile, userId })),
				catchError(() => observableOf(null)))
			);
		});
	}
}
