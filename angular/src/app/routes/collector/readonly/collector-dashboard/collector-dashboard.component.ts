import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { switchMap, Observable } from 'rxjs';

import { CollectorService } from '../../collector.service';

import type { Collector } from '../../../../shared/types';

@Component({
	selector: "cc-collector-dashboard",
	templateUrl: "./collector-dashboard.component.html",
	styleUrls: [ "./collector-dashboard.component.scss" ]
})
export class CollectorDashboardComponent extends SubscriptionManagerComponent {
  public readonly collector$: Observable<Collector>;

  constructor(
    private readonly collectorService: CollectorService,
    activatedRoute: ActivatedRoute,
  ){
    super();
    const observe = activatedRoute.parent == null ? activatedRoute.params : activatedRoute.parent.params;
    this.collector$ = observe.pipe(
		switchMap(params => {
			const collectorId = params["collectorId"] as unknown;
			if(typeof collectorId !== "string") {
				throw new Error("collectorId is not a string");
			}

			return this.collectorService.getCollector(collectorId);
		})
	);
  }
}
