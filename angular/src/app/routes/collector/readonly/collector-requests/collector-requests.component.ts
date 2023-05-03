import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, combineLatest as observableCombineLatest, Observable, BehaviorSubject, ReplaySubject, Subject, share } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CollectorService } from '../../collector.service';
import { CollectorRequestsService } from './collector-requests.service';
import { CollectorAddDialogComponent } from '../collector-add-dialog';

import type { Collector, Id } from '../../../../shared/types';
import type { CardTypeIndexResponse } from '../types';
import type { PageEvent } from '@angular/material/paginator';

@Component({
	selector: "cc-collector-requests",
	templateUrl: "./collector-requests.component.html",
	styleUrls: [ "./collector-requests.component.scss" ]
})
export class CollectorRequestsComponent extends SubscriptionManagerComponent {
  public readonly collector$: Observable<Collector>;
  public readonly loading$: Observable<unknown>;

  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly reloadCardTypesSubject: Subject<void> = new Subject();
  private readonly cardTypeIndexSubject: ReplaySubject<CardTypeIndexResponse> = new ReplaySubject<CardTypeIndexResponse>(1);
  public readonly cardTypeIndex$: Observable<CardTypeIndexResponse>;

  constructor(
    private readonly collectorService: CollectorService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly matDialog: MatDialog,
    private readonly collectorRequestsService: CollectorRequestsService,
  ){
    super();
    let observe = this.activatedRoute.params;
    if(this.activatedRoute.parent != null) observe = this.activatedRoute.parent.params
    this.collector$ = observe.pipe(
		switchMap(params => {
			const collectorId = params["collectorId"] as unknown;
			if(typeof collectorId !== "string") {
				throw new Error("collectorId is not a string");
			}

			return this.collectorService.getCollector(collectorId);
		})
	);

	const collectorTypes = observableCombineLatest([this.collector$, this.pageSubject.asObservable(), this.reloadCardTypesSubject.asObservable()]).pipe(
		switchMap(([{id}, page]) => this.collectorRequestsService.indexRequestedCardTypes(id, "", page)),
		share()
	);
	this.loading$ = collectorTypes.pipe();
    this.registerSubscription(collectorTypes.subscribe(cardTypeIndex => this.cardTypeIndexSubject.next(cardTypeIndex)));

    this.cardTypeIndex$ = this.cardTypeIndexSubject.asObservable();
    this.reloadCardTypes();
  }

  public openAddDialog(collectorId: Id): void {
		CollectorAddDialogComponent.open(this.matDialog, collectorId);
	}
  public reloadCardTypes(): void {
    this.reloadCardTypesSubject.next();
  }

  public changePage(page: PageEvent): void {
    this.pageSubject.next(page.pageIndex);
  }
}
