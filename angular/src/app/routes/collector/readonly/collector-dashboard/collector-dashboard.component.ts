import { Component, Input } from '@angular/core';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';

import type { Collector } from '../../../../shared/types';

@Component({
	selector: "cc-collector-dashboard",
	templateUrl: "./collector-dashboard.component.html",
	styleUrls: [ "./collector-dashboard.component.scss" ]
})
export class CollectorDashboardComponent extends SubscriptionManagerComponent {
  @Input()
  public collector: Collector | undefined = undefined;

  constructor(){
    super();
  }
}
