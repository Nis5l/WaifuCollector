import { Component, Input } from '@angular/core';
import { Observable,  ReplaySubject } from 'rxjs';
import type { SafeResourceUrl } from '@angular/platform-browser';

import type { UnlockedCard, Card } from '../../types';
import { CardService } from './card.service';

function isCard(card: UnlockedCard | Card): card is Card {
	return !("id" in card);
}

@Component({
	selector: 'cc-card',
	templateUrl: './card.component.html',
	styleUrls: [ './card.component.scss' ],
})
export class CardComponent {
	private _card: string | UnlockedCard | Card | null = null;
	private readonly cardSubject: ReplaySubject<UnlockedCard | Card> = new ReplaySubject(1);
	public readonly card$: Observable<UnlockedCard | Card>;

	@Input()
	public set card(card: string | UnlockedCard | Card) {
		this._card = card;
		if(typeof card === "string") {
			this.cardService.getCard(card).subscribe(data => this.cardSubject.next(data));
		} else {
			this.cardSubject.next(card);
		}
	}
	public get card(): string | UnlockedCard | Card {
		if(this._card == null) throw new Error("cardId not set");
		return this._card;
	}

	@Input()
	public cardImage: string | SafeResourceUrl | null = null;

	constructor(private readonly cardService: CardService) {
		this.card$ = this.cardSubject.asObservable();
	}

	public getCardEffectImage(card: Card | UnlockedCard): string | null {
		if(isCard(card)) return null;
		return card.cardEffect.image;
	}

	public getCardImage(card: Card | UnlockedCard): string | SafeResourceUrl {
		if(this.cardImage) return this.cardImage;
		return this.cardService.getCardImage((isCard(card) ? card : card.card).cardInfo.id);
	}

	public getCardName(card: Card | UnlockedCard): string {
		return (isCard(card) ? card : card.card).cardInfo.name;
	}

	public getCardTypeName(card: Card | UnlockedCard): string {
		return (isCard(card) ? card : card.card).cardType.name;
	}

	public getCardFrameFront(card: Card | UnlockedCard): string {
		if(isCard(card)) return this.cardService.getDefaultCardFrameFront();
		return card.cardFrame.front;
	}
}
