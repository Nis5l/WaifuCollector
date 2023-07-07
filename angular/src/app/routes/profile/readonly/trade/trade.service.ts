import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';
import type { TradeInfoResponse } from './types';

@Injectable()
export class TradeService {
  constructor(private readonly httpService: HttpService) {}

  public getTradeinfo(userId: Id): Observable<TradeInfoResponse> {
    return this.httpService.get(`/trade/${userId}/<collector_id>`);
  }
}
