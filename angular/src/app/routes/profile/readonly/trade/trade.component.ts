import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';

import { TradeService } from './trade.service';
import type { TradeInfoResponse } from './types';
import type { Id } from '../../../../shared/types';

@Component({
  selector: "cc-profile-trade",
  templateUrl: "./trade.component.html",
  styleUrls: [ "./trade.component.scss" ],
})
export class TradeComponent {
  private readonly tradeInfo: Observable<TradeInfoResponse>;

  constructor(
    private readonly tradeService: TradeService,
    activatedRoute: ActivatedRoute
  ) {
    const userId$ = activatedRoute.params.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    const collectorId$ = activatedRoute.params.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );

    this.tradeInfo = userId$.pipe(
      switchMap(userId => this.tradeService.getTradeinfo(userId))
    );
  }
}
