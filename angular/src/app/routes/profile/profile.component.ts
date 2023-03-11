import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf, catchError, map } from 'rxjs';

import { ProfileService } from './profile.service';
import { LoadingService } from '../../loading';
import type { Profile } from './types';
import type { Id } from '../../types';

import { BaseComponent } from '../../base-component';

@Component({
	selector: "cc-profile",
	templateUrl: "./profile.component.html",
	styleUrls: [ "/profile.component.scss" ]
})
export class ProfileComponent extends BaseComponent{
	public profile$: Observable<(Profile & { userId: Id }) | null> = observableOf(null);

	constructor(
		private readonly profileService: ProfileService,
		loadingService: LoadingService,
		activatedRoute: ActivatedRoute
	) {
		super();
		loadingService.setLoading(true);
		//TODO: pipe instead of subscribe
		this.registerSubscription(
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
			})
		);
	}
}
