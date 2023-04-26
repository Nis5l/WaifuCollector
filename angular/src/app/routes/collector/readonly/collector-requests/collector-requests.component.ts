import { Component, Input } from '@angular/core';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, combineLatest as observableCombineLatest, Observable, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

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
  private _collector: Collector | undefined = undefined;

  get collector(): Collector | undefined{
    return this._collector;
  }

  @Input()
  set collector(collector: Collector | undefined){
    this._collector = collector;
    if(collector == null) return;
    this.registerSubscription(
      this.loadingService.waitFor(
        observableCombineLatest([this.pageSubject.asObservable(), this.reloadCardTypesSubject.asObservable()]).pipe(
          switchMap(([page]) => this.collectorRequestsService.indexRequestedCardTypes(collector.id, "", page))
        )
      ).subscribe(cardTypeIndex => this.cardTypeIndexSubject.next(cardTypeIndex))
    );
    this.reloadCardTypes();
  }

  private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly reloadCardTypesSubject: Subject<void> = new Subject();
  private readonly cardTypeIndexSubject: ReplaySubject<CardTypeIndexResponse> = new ReplaySubject<CardTypeIndexResponse>(1);
  public readonly cardTypeIndex$: Observable<CardTypeIndexResponse>;

  constructor(
    private readonly matDialog: MatDialog,
    private readonly collectorRequestsService: CollectorRequestsService,
    private readonly loadingService: LoadingService
  ){
    super();
    this.cardTypeIndex$ = this.cardTypeIndexSubject.asObservable();
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
