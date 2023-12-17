import { Component } from '@angular/core';
import { ActivatedRoute, type Route } from '@angular/router';
import { Observable, map, switchMap, combineLatest as observableCombineLatest, share } from 'rxjs';

import type { Id } from '../../../../../shared/types';
import type { TradeInfoResponse } from '../types';
import { TradeService } from '../trade.service';
import { TradeSelfInventoryComponent } from './trade-self-inventory';
import { TradeSelfTradeComponent } from './trade-self-trade';

const ROUTES: Route[] = [
  { path: "", pathMatch: "full", component: TradeSelfTradeComponent },
  { path: "inventory", component: TradeSelfInventoryComponent },
];

@Component({
  selector: "cc-trade-self",
  templateUrl: "./trade-self.component.html",
  styleUrls: [ "./trade-self.component.scss" ]
})
export class TradeSelfComponent {
  //TODO: split for self and friend
  public readonly tradeInfo$: Observable<TradeInfoResponse>;

  constructor(
    private readonly tradeService: TradeService,
    activatedRoute: ActivatedRoute,
  ) {
    const params$ = activatedRoute.parent?.params ?? activatedRoute.params;

    const userId$: Observable<Id> = params$.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    const collectorId$: Observable<Id> = params$.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );

    this.tradeInfo$ = observableCombineLatest([userId$, collectorId$]).pipe(
      switchMap(([userId, collectorId]) => this.tradeService.getTradeinfo(userId, collectorId)),
      share()
    );
  }

  public static getRoutes(): Route[] {
    return ROUTES;
  }
}
