import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, Observable, combineLatest as observableCombineLatest, BehaviorSubject } from 'rxjs';

import { CollectorService } from '../collector.service';
import { CollectorReadonlyService } from './collector-readonly.service';
import { LoadingService, AuthService } from '../../../shared/services';
import { SubscriptionManagerComponent } from '../../../shared/abstract';
import type { Collector, Id, CardType } from '../../../shared/types';
import { CollectorAddDialogComponent } from './collector-add-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
	selector: "cc-collector-readonly",
	templateUrl: "./collector-readonly.component.html",
	styleUrls: [ "./collector-readonly.component.scss" ]
})
export class CollectorReadonlyComponent extends SubscriptionManagerComponent {
	public readonly collector$: Observable<Collector>;
	public readonly canEdit$: Observable<boolean>;

	public readonly cardTypesSubject: BehaviorSubject<CardType[]> = new BehaviorSubject<CardType[]>([]);
	public readonly cardTypes$: Observable<CardType[]>;
	
	constructor(
		private readonly router: Router,
		private readonly collectorService: CollectorService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly matDialog: MatDialog,
		private readonly collectorReadonlyService: CollectorReadonlyService,
		loadingService: LoadingService
	) {
		super();
		this.collector$ = loadingService.waitFor(activatedRoute.params.pipe(
			switchMap(params => {
				const collectorId = params["collectorId"] as unknown;
				if(typeof collectorId !== "string") {
					throw new Error("collectorId is not a string");
				}

				return this.collectorService.getCollector(collectorId);
			})
		));
		
		this.canEdit$ = observableCombineLatest([this.collector$, this.authService.authData()]).pipe(
			map(([collector, authData]) => AuthService.userIdEqual(collector.userId, authData?.userId))
		);

		this.registerSubscription(loadingService.waitFor(this.collector$.pipe(
			switchMap(({ id }) => this.collectorReadonlyService.indexRequestedCardTypes(id, "", 0))
		)).subscribe(cardTypes => this.cardTypesSubject.next(cardTypes)));

		this.cardTypes$ = this.cardTypesSubject.asObservable();
	}

	public edit(): void {
		this.router.navigate(["edit"], { relativeTo: this.activatedRoute });
	}

	public removeCardType(cardTypeId: Id): void {
		this.cardTypesSubject.next(this.cardTypesSubject.getValue().filter(cardType => cardType.id != cardTypeId));
	}

	public openAddDialog(collectorId: Id): void {
		CollectorAddDialogComponent.open(this.matDialog, collectorId);
	}
}
