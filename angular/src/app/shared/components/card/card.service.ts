import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { UnlockedCard, Id, IdInt } from '../../types';
import { HttpService } from '../../services';

@Injectable()
export class CardService {
	constructor(private readonly httpService: HttpService) {}

	public getCard(id: string): Observable<UnlockedCard> {
		return this.httpService.get<UnlockedCard>(`/card/unlocked/${id}`);
	}

	public getDefaultCardFrameFront(): string {
		return this.httpService.apiUrl("/card/card-frame-front");
	}

  public getCardFrameFront(id: IdInt): string {
		return this.httpService.apiUrl(`/card/${id}/card-frame-front`);
  }

	public getCardImage(cardId: Id): string {
		return this.httpService.apiUrl(`/card/${cardId}/card-image`);
	}
}
