import { Component, Input } from '@angular/core';
import { Observable,  ReplaySubject, catchError, of as observableOf } from 'rxjs';
import type { SafeResourceUrl } from '@angular/platform-browser';

import type { UnlockedCard, Card, CardOrUnlockedCardId } from '../../types';
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
	private _card: CardOrUnlockedCardId | UnlockedCard | Card | null = null;
	private readonly cardSubject: ReplaySubject<UnlockedCard | Card | null> = new ReplaySubject(1);
	public readonly card$: Observable<UnlockedCard | Card | null>;

	@Input()
	public set card(card: CardOrUnlockedCardId | UnlockedCard | Card | null) {
		this._card = card;
		if(card != null && "unlocked" in card) {
			this.cardService.getCard(card.id).pipe(
        catchError(_ => observableOf(null))
      ).subscribe(data => this.cardSubject.next(data));
		} else {
			this.cardSubject.next(card);
		}
	}
	public get card(): CardOrUnlockedCardId | UnlockedCard | Card | null {
		if(this._card == null) throw new Error("cardId not set");
		return this._card;
	}

	@Input()
	public cardImage: string | SafeResourceUrl | null = null;

	constructor(private readonly cardService: CardService) {
		this.card$ = this.cardSubject.asObservable();
	}

	public getCardEffectImage(card: Card | UnlockedCard | null): string | null {
		if(card == null || isCard(card)) return null;
		return card.cardEffect?.image ?? null;
	}

	public getCardImage(card: Card | UnlockedCard | null): string | SafeResourceUrl | null {
    if(card == null) return null;
		if(this.cardImage) return this.cardImage;
		return this.cardService.getCardImage((isCard(card) ? card : card.card).cardInfo.id);
	}

	public getCardName(card: Card | UnlockedCard | null): string {
    if(card == null) return "";
		return (isCard(card) ? card : card.card).cardInfo.name;
	}

	public getCardTypeName(card: Card | UnlockedCard | null): string {
    if(card == null) return "";
		return (isCard(card) ? card : card.card).cardType.name;
	}

	public getCardFrameFront(card: Card | UnlockedCard | null): string {
		if(card == null || isCard(card) || card.cardFrame == null) return this.cardService.getDefaultCardFrameFront();
		return this.cardService.getCardFrameFront(card.cardFrame.id);
	}

	public getCardFrameBack(card: Card | UnlockedCard | null): string {
		if(card == null || isCard(card) || card.cardFrame == null) return this.cardService.getDefaultCardFrameBack();
		return this.cardService.getCardFrameBack(card.cardFrame.id);
	}

  public getCardLevel(card: Card | UnlockedCard | null): string | null {
    if(card == null || isCard(card)) return null;
    return card.level.toString();
  }

  public getCardQuality(card: Card | UnlockedCard | null): string | null {
    if(card == null || isCard(card)) return null;
    return card.quality.toString();
  }
}
