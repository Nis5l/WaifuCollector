import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf, catchError, map } from 'rxjs';

import { LoadingService } from '../../../shared/services';
import type { Id } from '../../../shared/types';
import { ProfileService } from '../profile.service';
import type { Profile } from '../shared';

@Component({
	selector: "cc-profile-readonly",
	templateUrl: "./profile-readonly.component.html",
	styleUrls: [ "/profile-readonly.component.scss" ]
})
export class ProfileReadonlyComponent {
	public profile$: Observable<(Profile & { userId: Id }) | null> = observableOf(null);

	constructor(
		private readonly profileService: ProfileService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly router: Router,
		loadingService: LoadingService,
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

	public edit(): void {
		this.router.navigate(["edit"], { relativeTo: this.activatedRoute });
	}
}
