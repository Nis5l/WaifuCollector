import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, combineLatest as observableCombineLatest, Observable, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CollectorService } from '../../collector.service';
import { LoadingService } from '../../../../shared/services';
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

  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly reloadCardTypesSubject: Subject<void> = new Subject();
  private readonly cardTypeIndexSubject: ReplaySubject<CardTypeIndexResponse> = new ReplaySubject<CardTypeIndexResponse>(1);
  public readonly cardTypeIndex$: Observable<CardTypeIndexResponse>;

  constructor(
    private readonly collectorService: CollectorService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly matDialog: MatDialog,
    private readonly collectorRequestsService: CollectorRequestsService,
    private readonly loadingService: LoadingService
  ){
    super();
    let observe = this.activatedRoute.params;
    if(this.activatedRoute.parent != null) observe = this.activatedRoute.parent.params
    this.collector$ = this.loadingService.waitFor(observe.pipe(
			switchMap(params => {
				const collectorId = params["collectorId"] as unknown;
        if(typeof collectorId !== "string") {
					throw new Error("collectorId is not a string");
				}

				return this.collectorService.getCollector(collectorId);
			})
		));

    this.registerSubscription(
      this.loadingService.waitFor(
        observableCombineLatest([this.collector$, this.pageSubject.asObservable(), this.reloadCardTypesSubject.asObservable()]).pipe(
          switchMap(([{id}, page]) => this.collectorRequestsService.indexRequestedCardTypes(id, "", page))
        )
      ).subscribe(cardTypeIndex => this.cardTypeIndexSubject.next(cardTypeIndex))
    );

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
