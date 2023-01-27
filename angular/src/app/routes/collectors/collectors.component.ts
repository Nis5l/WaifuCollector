import { Component, OnInit } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';

import type { Collector } from './collector';
import { CollectorsService } from './collectors.service';
import { LoadingService } from '../../loading';

@Component({
	selector: 'cc-collectors',
	templateUrl: './collectors.component.html',
	styleUrls: [ './collectors.component.scss' ]
})
export class CollectorsComponent implements OnInit {
	private readonly collectorsSubject: ReplaySubject<Collector[]> = new ReplaySubject<Collector[]>(1);
	public readonly collectors$: Observable<Collector[] | null>;

	constructor(private readonly collectorsService: CollectorsService, private readonly loadingService: LoadingService) {
		this.collectors$ = this.collectorsSubject.asObservable();
	}

	public ngOnInit(): void {
		this.loadingService.waitFor(this.collectorsService.getCollectors()).subscribe(collectors => {
			this.collectorsSubject.next(collectors);
		});
	}
}
