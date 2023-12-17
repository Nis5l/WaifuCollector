import { Injectable } from '@angular/core';

import { HttpService } from '../../../../../../shared/services';

@Injectable()
export class TradeSelfTradeService {
  constructor(private readonly httpService: HttpService) {}
}
