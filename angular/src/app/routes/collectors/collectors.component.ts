import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ReplaySubject, Observable, debounceTime, distinctUntilChanged, BehaviorSubject, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog'; 

import type { Collector } from './collector';
import { CollectorsService } from './collectors.service';
import { NewCollectorDialogComponent } from './new-collector-dialog';

import { BaseComponent } from '../../base-component';

@Component({
	selector: 'cc-collectors',
	templateUrl: './collectors.component.html',
	styleUrls: [ './collectors.component.scss' ]
})
export class CollectorsComponent extends BaseComponent{
	private readonly collectorsSubject: ReplaySubject<Collector[]> = new ReplaySubject<Collector[]>(1);
	public readonly collectors$: Observable<Collector[] | null>;

	public readonly formGroup;
	private readonly searchForm;

	public readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly loading$: Observable<boolean>;

	constructor(
		private readonly collectorsService: CollectorsService,
		private readonly matDialog: MatDialog,
	) {
		super();
		this.collectors$ = this.collectorsSubject.asObservable();
		this.loading$ = this.loadingSubject.asObservable();

		this.searchForm = new FormControl("", { nonNullable: true });
		this.registerSubscription(
			this.searchForm.valueChanges.pipe(
				startWith(""),
				debounceTime(500),
				distinctUntilChanged(),
			).subscribe((search) => {
				this.loadCollectors(search, 0);
			})
		);

		this.formGroup = new FormGroup({
			search: this.searchForm
		});
	}

	public newCollector(): void {
		this.matDialog.open<NewCollectorDialogComponent>(NewCollectorDialogComponent, {})
	}

	private loadCollectors(search: string, page: number): void {
		this.loadingSubject.next(true);
		this.collectorsSubject.next([]);
		this.registerSubscription(
			this.collectorsService.getCollectors(search, page).subscribe(collectors => {
				this.collectorsSubject.next(collectors);
				this.loadingSubject.next(false);
			})
		);
	}
}
