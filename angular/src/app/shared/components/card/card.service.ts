import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { UnlockedCard, Id } from '../../types';
import { HttpService } from '../../services';

@Injectable()
export class CardService {
	constructor(private readonly httpService: HttpService) {}

	public getCard(id: string): Observable<UnlockedCard> {
		return this.httpService.get<UnlockedCard>(`/card/unlocked/${id}`);
	}

	public getDefaultCardFrameFront(): string {
		return this.httpService.apiUrl("/card/card-frame-front-default");
	}

	public getCardImage(cardId: Id): string {
		return this.httpService.apiUrl(`/card/${cardId}/card-image`);
	}
}
