import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, filter, map } from 'rxjs';

import { CollectorBannerService } from './collector-banner.service';
import type { CollectorBanner } from './types';
import { AuthService } from '../../../auth-service';
import { LoadingService } from '../../../loading';

@Component({
	selector: 'cc-collector-banner',
	templateUrl: './collector-banner.component.html',
	styleUrls: [ './collector-banner.component.scss' ]
})
export class CollectorBannerComponent {
	private collectorBannerSubject: BehaviorSubject<CollectorBanner | null> = new BehaviorSubject<CollectorBanner | null>(null);
	public readonly collectorBanner$: Observable<string>;
	public readonly editable$: Observable<boolean>;

	@Input()
	public set collector(collectorBanner: CollectorBanner) {
		this.collectorBannerSubject.next(collectorBanner);
	}
	public get collector(): CollectorBanner {
		const collectorBanner = this.collectorBannerSubject.getValue();
		if(collectorBanner == null) throw new Error("collectorId not set");
		return collectorBanner;
	}

	constructor(
		private readonly collectorBannerService: CollectorBannerService,
		private readonly authService: AuthService,
		private readonly loadingService: LoadingService
	) {
		this.collectorBanner$ = this.collectorBannerSubject.asObservable().pipe(
			filter((collectorBanner): collectorBanner is CollectorBanner => collectorBanner != null),
			map(collectorBanner => `${this.collectorBannerService.getBannerUrl(collectorBanner.id)}?${new Date().getTime()}`)
		);

		this.editable$ = this.collectorBannerSubject.asObservable().pipe(
			filter((collectorBanner): collectorBanner is CollectorBanner => collectorBanner != null),
			map(collectorBanner => this.authService.getUserId() == collectorBanner.userId.toLowerCase())
		);
	}

	public uploadImage(target: EventTarget | null): void {
		if(target == null || !(target instanceof HTMLInputElement)) throw new Error("target has to be input");

		const file = target.files?.item(0);
		if(file == null) throw new Error("no file");

		this.loadingService.waitFor(this.collectorBannerService.uploadBanner(this.collector.id, file)).subscribe(
			() => this.collectorBannerSubject.next(this.collectorBannerSubject.getValue())
		);
	}
}
