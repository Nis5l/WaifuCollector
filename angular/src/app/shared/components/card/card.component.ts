import { Component, Input } from '@angular/core';
import { Observable,  ReplaySubject } from 'rxjs';

import type { Card, CardData } from '../../types';
import { CardService } from './card.service';

@Component({
	selector: 'cc-card',
	templateUrl: './card.component.html',
	styleUrls: [ './card.component.scss' ],
})
export class CardComponent {
	private _card: string | CardData | null = null;
	private readonly cardSubject: ReplaySubject<Card | CardData> = new ReplaySubject(1);
	public readonly card$: Observable<Card | CardData>;

	@Input()
	public set card(card: string | CardData) {
		this._card = card;
		if(typeof card === "string") {
			this.cardService.getCard(card).subscribe(data => this.cardSubject.next(data));
		} else {
			this.cardSubject.next(card);
		}
	}
	public get card(): string | CardData {
		if(this._card == null) throw new Error("cardId not set");
		return this._card;
	}

	constructor(private readonly cardService: CardService) {
		this.card$ = this.cardSubject.asObservable();
	}
}
