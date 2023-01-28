import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ReplaySubject, Observable, debounceTime, distinctUntilChanged, BehaviorSubject, startWith } from 'rxjs';

import type { Collector } from './collector';
import { CollectorsService } from './collectors.service';

@Component({
	selector: 'cc-collectors',
	templateUrl: './collectors.component.html',
	styleUrls: [ './collectors.component.scss' ]
})
export class CollectorsComponent {
	private readonly collectorsSubject: ReplaySubject<Collector[]> = new ReplaySubject<Collector[]>(1);
	public readonly collectors$: Observable<Collector[] | null>;

	public readonly formGroup: FormGroup;
	private readonly searchForm: FormControl;

	public readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly loading$: Observable<boolean>;

	constructor(private readonly collectorsService: CollectorsService) {
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

	private loadCollectors(search: string, page: number): void {
		this.loadingSubject.next(true);
		this.collectorsSubject.next([]);
		this.collectorsService.getCollectors(search, page).subscribe(collectors => {
			this.collectorsSubject.next(collectors);
			this.loadingSubject.next(false);
		});
	}
}
