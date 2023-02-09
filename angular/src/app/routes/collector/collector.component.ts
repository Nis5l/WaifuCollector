import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, of as observableOf, Observable } from 'rxjs';

import { CollectorService } from './collector.service';
import { LoadingService } from '../../loading';
import type { Collector } from '../../types';

@Component({
	selector: "cc-collector",
	templateUrl: "./collector.component.html",
	styleUrls: [ "./collector.component.scss" ]
})
export class CollectorComponent {
	public readonly collector$: Observable<Collector | null>;
	
	constructor(public readonly collectorService: CollectorService, activatedRoute: ActivatedRoute, loadingService: LoadingService) {
		loadingService.setLoading(true);
		this.collector$ = activatedRoute.params.pipe(
			switchMap(params => {
				const collectorId = params["collectorId"] as unknown;
				if(typeof collectorId !== "string") {
					loadingService.setLoading(false);
					return observableOf(null);
				}

				return loadingService.waitFor(collectorService.getCollector(collectorId))
			})
		);
	}
}
