import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../../shared/services';
import type { Id } from '../../../../../../shared/types';

@Injectable()
export class TradeSelfTradeService {
  constructor(private readonly httpService: HttpService) {}

  public removeCard(friendId: Id, collectorId: Id, cardId: Id): Observable<void> {
    return this.httpService.post(`/trade/${friendId}/${collectorId}/card/remove/${cardId}`, {});
  }
}
