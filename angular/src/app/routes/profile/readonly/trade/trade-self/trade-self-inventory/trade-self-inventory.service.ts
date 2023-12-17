import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../../shared/services';
import type { Id } from '../../../../../../shared/types';

@Injectable()
export class TradeSelfInventoryService {
  constructor(private readonly httpService: HttpService) {}

  public addCard(userId: Id, collectorId: Id, cardId: Id): Observable<unknown> {
    return this.httpService.post(`/trade/${userId}/${collectorId}/card/add/${cardId}`, {});
  }
}
