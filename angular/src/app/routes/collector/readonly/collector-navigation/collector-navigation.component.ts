import { Component, Input } from '@angular/core';

import type { NavigationItem } from './types';

@Component({
	selector: "cc-collector-navigation",
	templateUrl: "./collector-navigation.component.html",
	styleUrls: [ "./collector-navigation.component.scss" ]
})
export class CollectorNavigationComponent{
  @Input()
  public items: NavigationItem[] = [];
}
