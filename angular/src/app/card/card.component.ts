import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import type { Card } from './types';
import { CardService } from './card.service';

@Component({
	selector: 'cc-card',
	templateUrl: './card.component.html',
	styleUrls: [ './card.component.scss' ],
})
export class CardComponent {
	private _cardId: string | null = null;

	@Input()
	public set cardId(id: string) {
		this._cardId = id;
	}
	public get cardId(): string {
		if(this._cardId == null) throw new Error("cardId not set");
		return this._cardId;
	}

	private readonly card$: Observable<Card>;

	constructor(private readonly cardService: CardService) {
		this.card$ = this.cardService.getCard(this.cardId);
	}
}
