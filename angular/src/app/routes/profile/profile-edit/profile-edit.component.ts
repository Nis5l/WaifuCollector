import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf, catchError, map } from 'rxjs';

import { ProfileService } from '../profile.service';
import { LoadingService } from '../../../loading';
import type { Profile } from '../shared';
import type { Id } from '../../../types';

@Component({
	selector: "cc-profile-edit",
	templateUrl: "./profile-edit.component.html",
	styleUrls: [ "/profile-edit.component.scss" ]
})
export class ProfileEditComponent {
	public profile$: Observable<(Profile & { userId: Id }) | null> = observableOf(null);

	constructor(
		private readonly profileService: ProfileService,
		loadingService: LoadingService,
		activatedRoute: ActivatedRoute
	) {
		loadingService.setLoading(true);
		//TODO: pipe instead of subscribe
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
