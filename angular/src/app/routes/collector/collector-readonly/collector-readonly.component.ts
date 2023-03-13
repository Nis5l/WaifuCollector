import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of as observableOf, Observable } from 'rxjs';

import { CollectorService } from '../collector.service';
import { LoadingService } from '../../../shared/services';
import type { Collector } from '../../../shared/types';

@Component({
	selector: "cc-collector-readonly",
	templateUrl: "./collector-readonly.component.html",
	styleUrls: [ "./collector-readonly.component.scss" ]
})
export class CollectorReadonlyComponent {
	public readonly collector$: Observable<Collector | null>;
	
	constructor(
		private readonly router: Router,
		private readonly collectorService: CollectorService,
		private readonly activatedRoute: ActivatedRoute,
		loadingService: LoadingService
	) {
		loadingService.setLoading(true);
		this.collector$ = activatedRoute.params.pipe(
			switchMap(params => {
				const collectorId = params["collectorId"] as unknown;
				if(typeof collectorId !== "string") {
					loadingService.setLoading(false);
					return observableOf(null);
				}

				return loadingService.waitFor(this.collectorService.getCollector(collectorId))
			})
		);
	}

	public edit(): void {
		this.router.navigate(["edit"], { relativeTo: this.activatedRoute });
	}
}
