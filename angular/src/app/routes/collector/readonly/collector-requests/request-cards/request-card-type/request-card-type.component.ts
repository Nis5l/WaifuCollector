import { Component, Input, Output, EventEmitter } from '@angular/core';

import type { CardType, Id } from '../../../../../../shared/types';
import { RequestCardTypeService } from './request-card-type.service';
import { LoadingService } from '../../../../../../shared/services';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';

//TODO: ADD TIMES FOR ALL CARDS
//TODO: CHAT

@Component({
	selector: 'cc-request-card-type',
	templateUrl: './request-card-type.component.html',
	styleUrls: [ './request-card-type.component.scss' ]
})
export class RequestCardTypeComponent extends SubscriptionManagerComponent {
	@Output()
	public readonly onRemove: EventEmitter<void> = new EventEmitter<void>();

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

	constructor(
		private readonly requestCardTypeService: RequestCardTypeService,
		private readonly loadingService: LoadingService
	) {
		super();
	}

	public accept(): void {
		this.registerSubscription(this.loadingService.waitFor(this.requestCardTypeService.accept(this.cardType.id)).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error accepting Card-Type Request")
		}));
	}

	public decline(): void {
		this.registerSubscription(this.loadingService.waitFor(this.requestCardTypeService.decline(this.cardType.id)).subscribe({
			next: () => this.onRemove.next(),
			error: () => console.error("Error declining Card-Type Request")
		}));
	}
}
