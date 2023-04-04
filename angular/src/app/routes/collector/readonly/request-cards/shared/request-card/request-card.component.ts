import { Component, Input } from '@angular/core';

import type { Id } from '../../../../../../shared/types';

@Component({
	selector: 'cc-request-card',
	templateUrl: './request-card.component.html',
	styleUrls: [ './request-card.component.scss' ]
})
export class RequestCardComponent {
	private _collectorId: Id | null = null;
	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
	}
	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	private _userId: Id | null = null;
	@Input()
	public set userId(id: Id | null | undefined) {
		if(id == null) return;
		this._userId = id;
	}
	public get userId(): Id {
		if(this._userId == null) throw new Error("userId not set");
		return this._userId;
	}

	@Input()
	public title: string = "UNSET";

	//TODO: show actions if admin
	constructor() {}
}
