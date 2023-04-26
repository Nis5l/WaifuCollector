import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ReplaySubject, Observable, debounceTime, distinctUntilChanged, BehaviorSubject, startWith, combineLatest as observableCombibeLatest } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import type { PageEvent } from '@angular/material/paginator';

import { CollectorsService } from './collectors.service';
import { NewCollectorDialogComponent } from './new-collector-dialog';
import type { CollectorsIndexResponse } from './types';

import { SubscriptionManagerComponent } from '../../shared/abstract';

@Component({
	selector: 'cc-collectors',
	templateUrl: './collectors.component.html',
	styleUrls: [ './collectors.component.scss' ]
})
export class CollectorsComponent extends SubscriptionManagerComponent {
	private readonly pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

	private readonly collectorIndexResponseSubject: ReplaySubject<CollectorsIndexResponse> = new ReplaySubject<CollectorsIndexResponse>(1);
	public readonly collectorIndexResponse$: Observable<CollectorsIndexResponse>;

	public readonly formGroup;
	private readonly searchForm;

	public readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly loading$: Observable<boolean>;

	constructor(
		private readonly collectorsService: CollectorsService,
		private readonly matDialog: MatDialog,
	) {
		super();
		this.collectorIndexResponse$ = this.collectorIndexResponseSubject.asObservable();
		this.loading$ = this.loadingSubject.asObservable();

		this.searchForm = new FormControl("", { nonNullable: true });
		this.registerSubscription(observableCombibeLatest([
			this.searchForm.valueChanges.pipe(
				startWith(""),
				debounceTime(500),
				distinctUntilChanged(),
			),
			this.pageSubject.asObservable()
		]).subscribe(([search, page]) => {
				this.loadCollectors(search, page);
			})
		);

		this.formGroup = new FormGroup({
			search: this.searchForm
		});
	}

	public newCollector(): void {
		NewCollectorDialogComponent.open(this.matDialog);
	}

	public changePage(page: PageEvent): void {
		this.pageSubject.next(page.pageIndex);
	}

	private loadCollectors(search: string, page: number): void {
		//TODO: rewrite if this can be solved using waitFor
		this.loadingSubject.next(true);
		this.registerSubscription(
			this.collectorsService.getCollectors(search, page).subscribe(collectorIndexResponse => {
				this.collectorIndexResponseSubject.next(collectorIndexResponse);
				this.loadingSubject.next(false);
			})
		);
	}
}
