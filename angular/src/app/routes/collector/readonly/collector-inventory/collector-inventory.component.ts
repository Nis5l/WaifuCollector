import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import type { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject, map, of as observableOf, combineLatest as observableCombineLatest, switchMap, startWith, debounceTime, distinctUntilChanged, share, delay } from 'rxjs';

import { CollectorInventoryService } from './collector-inventory.service';
import type { InventoryResponse } from './types';
import { SortType } from './types';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';

@Component({
  selector: "cc-collector-inventory",
  templateUrl: "./collector-inventory.component.html",
  styleUrls: [ "./collector-inventory.component.scss" ],
})
export class CollectorInventoryComponent extends SubscriptionManagerComponent {
  public readonly inventoryResponseSubject: BehaviorSubject<InventoryResponse>;
  public readonly inventoryResponse$: Observable<InventoryResponse>;
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public readonly formGroup: FormGroup;
  public loading$: Observable<unknown> = observableOf(undefined);
  public readonly sortTypes: { text: string, value: SortType }[] = [
    {
      text: "Name",
      value: SortType.Name,
    },
    {
      text: "Level",
      value: SortType.Level,
    },
    {
      text: "Recent",
      value: SortType.Recent,
    },
  ];

  constructor(
    private readonly collectorInventoryService: CollectorInventoryService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    super();
    const userId$ = this.activatedRoute.params.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    const collectorId$ = this.activatedRoute.parent?.params.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );
    if(collectorId$ == null) throw new Error("parent router not set");

    const searchFormControl = new FormControl("", { nonNullable: true });

    const sortTypeDefaultValue: SortType = this.sortTypes[0].value
    const sortTypeFormControl = new FormControl(sortTypeDefaultValue, { nonNullable: true });

    this.formGroup = new FormGroup({
      search: searchFormControl,
      sortType: sortTypeFormControl
    })
    const loadingInventoryResponse: InventoryResponse = { cards: [], cardCount: 0, page: 0, pageSize: 0 };
    this.inventoryResponseSubject = new BehaviorSubject(loadingInventoryResponse)
    this.inventoryResponse$ = this.inventoryResponseSubject.asObservable();

     this.registerSubscription(observableCombineLatest([userId$, collectorId$, this.pageSubject.asObservable(), searchFormControl.valueChanges.pipe(
      startWith(""),
      debounceTime(300),
      distinctUntilChanged()
    ), sortTypeFormControl.valueChanges.pipe(startWith(sortTypeDefaultValue))]).pipe(
      switchMap(([userId, collectorId, page, search, sortType]) => {
        this.inventoryResponseSubject.next(loadingInventoryResponse);
        const o = this.collectorInventoryService.getInventory(userId, collectorId, page, search, sortType).pipe(share());
        this.loading$ = o;
        return o;
      })
    ).subscribe(inventoryResponse => this.inventoryResponseSubject.next(inventoryResponse)));
  }

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}
}
