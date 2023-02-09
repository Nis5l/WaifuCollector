import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import type { Collector } from './types';

@Component({
	selector: 'cc-collector',
	templateUrl: './collector.component.html',
	styleUrls: [ './collector.component.scss' ],
})
export class CollectorComponent {
	private _collector: Collector | null = null;

	@Input()
	public set collector(collector: Collector) {
		this._collector = collector;
	}
	public get collector(): Collector {
		if(this._collector == null) throw new Error("Collector not set");
		return this._collector;
	}

	constructor(private readonly router: Router) {}

	public collectorClick(): void {
		this.router.navigate(["collector", this.collector.id]);
	}
}
