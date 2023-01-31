import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ReplaySubject, Observable, debounceTime, distinctUntilChanged, BehaviorSubject, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog'; 
import { HttpErrorResponse } from '@angular/common/http';

import type { Collector } from './collector';
import { CollectorsService } from './collectors.service';
import { NewCollectorDialogComponent } from './new-collector-dialog';
import type { NewCollector } from './new-collector-dialog';
import { LoadingService } from '../../loading';
import type { Id } from '../../types';

@Component({
	selector: 'cc-collectors',
	templateUrl: './collectors.component.html',
	styleUrls: [ './collectors.component.scss' ]
})
export class CollectorsComponent {
	private readonly collectorsSubject: ReplaySubject<Collector[]> = new ReplaySubject<Collector[]>(1);
	public readonly collectors$: Observable<Collector[] | null>;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	public readonly formGroup: FormGroup;
	private readonly searchForm: FormControl;

	public readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly loading$: Observable<boolean>;

	constructor(
		private readonly collectorsService: CollectorsService,
		private readonly matDialog: MatDialog,
		private readonly loadingService: LoadingService,
		private readonly router: Router,
	) {
		this.error$ = this.errorSubject.asObservable();
		this.collectors$ = this.collectorsSubject.asObservable();
		this.loading$ = this.loadingSubject.asObservable();

		this.searchForm = new FormControl();
		this.searchForm.valueChanges.pipe(
			startWith(""),
			debounceTime(500),
			distinctUntilChanged(),
		).subscribe((search: unknown) => {
			if(typeof search !== "string") throw Error("search is not a string");
			this.loadCollectors(search, 0);
		});

		this.formGroup = new FormGroup({
			search: this.searchForm
		});
	}

	public newCollector(): void {
		const redirect = (id: Id) => this.router.navigate(["collector", id]);
		this.loadingService.waitFor(this.matDialog.open<NewCollectorDialogComponent, undefined, NewCollector | null>(NewCollectorDialogComponent, {}).afterClosed())
			.subscribe(data => {
				if(data == null) return;
				const image = data.image;
				this.collectorsService.createCollector(data).subscribe({
					next: res => {
						this.errorSubject.next(null);
						const id = res.id;
						if(image == null) {
							redirect(id);
							return;
						}
						this.loadingService.waitFor(this.collectorsService.setCollectorImage(id, image)).subscribe({
							error: () => redirect(id),
							next: () => redirect(id)
						})
					},
					error: (err: HttpErrorResponse) => {
						this.errorSubject.next(err.error?.error ?? "Creating collector failed");
					}
				});
			});
	}

	private loadCollectors(search: string, page: number): void {
		this.loadingSubject.next(true);
		this.collectorsSubject.next([]);
		this.collectorsService.getCollectors(search, page).subscribe(collectors => {
			this.collectorsSubject.next(collectors);
			this.loadingSubject.next(false);
		});
	}
}
