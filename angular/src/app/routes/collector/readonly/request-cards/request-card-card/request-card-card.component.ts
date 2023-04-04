import { Component, Input } from '@angular/core';

import type { CardType, Id } from '../../../../../shared/types';

@Component({
	selector: 'cc-request-card-type',
	templateUrl: './request-card-type.component.html',
	styleUrls: [ './request-card-type.component.scss' ]
})
export class RequestCardTypeComponent {
	private _cardType: CardType | null = null;
	@Input()
	public set cardType(cardType: CardType) {
		this._cardType = cardType;
	}
	public get cardType(): CardType {
		if(this._cardType == null) throw new Error("cardType not set");
		return this._cardType;
	}

	private _collectorId: Id | null = null;
	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
	}
	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	constructor() {}
}
