import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, filter, map, combineLatest as observableCombineLatest } from 'rxjs';

import { CollectorBannerService } from './collector-banner.service';
import type { CollectorBanner } from './types';
import { AuthService, LoadingService } from '../../../../shared/services';

import { SubscriptionManagerComponent } from '../../../../shared/abstract';

@Component({
	selector: 'cc-collector-banner',
	templateUrl: './collector-banner.component.html',
	styleUrls: [ './collector-banner.component.scss' ]
})
export class CollectorBannerComponent extends SubscriptionManagerComponent {
	private collectorBannerSubject: BehaviorSubject<CollectorBanner | null> = new BehaviorSubject<CollectorBanner | null>(null);
	public readonly collectorBanner$: Observable<string>;
	public readonly editableSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
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

	@Input()
	public set editable(b: boolean) {
		this.editableSubject.next(b);
	}
	public get editable(): boolean {
		return this.editableSubject.getValue();
	}

	constructor(
		private readonly collectorBannerService: CollectorBannerService,
		private readonly authService: AuthService,
		private readonly loadingService: LoadingService
	) {
		super();
		const collectorBannerNonNull$ = this.collectorBannerSubject.asObservable().pipe(
			filter((collectorBanner): collectorBanner is CollectorBanner => collectorBanner != null)
		);
		this.collectorBanner$ = collectorBannerNonNull$.pipe(
			map(collectorBanner => `${this.collectorBannerService.getBannerUrl(collectorBanner.id)}?${new Date().getTime()}`)
		);

		this.editable$ = observableCombineLatest([this.editableSubject.asObservable(), collectorBannerNonNull$]).pipe(
			map(([editable, collectorBanner]) => editable === true && this.authService.getUserId() == collectorBanner.userId.toLowerCase())
		);
	}

	public uploadImage(target: EventTarget | null): void {
		if(target == null || !(target instanceof HTMLInputElement)) throw new Error("target has to be input");

		const file = target.files?.item(0);
		if(file == null) throw new Error("no file");

		this.registerSubscription(
			this.loadingService.waitFor(this.collectorBannerService.uploadBanner(this.collector.id, file)).subscribe(
				() => this.collectorBannerSubject.next(this.collectorBannerSubject.getValue())
			)
		);
	}
}
