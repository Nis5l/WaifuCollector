import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, tap, filter, switchMap, combineLatest as observableCombineLatest, share } from 'rxjs';

import { TradeSelfInventoryService } from './trade-self-inventory.service';
import type { Id } from '../../../../../../shared/types';
import { AuthService, LoadingService } from '../../../../../../shared/services';
import { ConfirmationDialogComponent } from '../../../../../../shared/dialogs';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';
import { TradeService } from '../../trade.service';
import type { TradeInfoResponse } from '../../types';

@Component({
  selector: "cc-trade-self-inventory",
  templateUrl: "./trade-self-inventory.component.html",
  styleUrls: [  "././trade-self-inventory.component.scss" ]
})
export class TradeSelfInventoryComponent extends SubscriptionManagerComponent {
  public readonly selfUserId$: Observable<Id>;
  public readonly userId$: Observable<Id>;
  public readonly collectorId$: Observable<Id>;
  public readonly excludeUuids$: Observable<Id[]>;

  constructor(
    private readonly tradeSelfInventoryService: TradeSelfInventoryService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly matDialog: MatDialog,
    private readonly loadingService: LoadingService,
    tradeService: TradeService,
    authService: AuthService,
  ) {
    super();
    const params$ = this.activatedRoute.parent?.parent?.params ?? this.activatedRoute.params;

    this.selfUserId$ = authService.authData().pipe(
      map(params => {
        if(params == null) throw new Error("authData undefined");
        return params.userId;
      }),
    );

    this.userId$ = params$.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    this.collectorId$ = params$.pipe(
      map(params => {
        const collectorId: unknown = params["collectorId"];
        if(typeof collectorId !== "string") throw new Error("collectorId param not set");
        return collectorId;
      }),
    );

    //TODO: make more specific, too much data
    const tradeInfo$: Observable<TradeInfoResponse> = observableCombineLatest([this.userId$, this.collectorId$]).pipe(
      switchMap(([userId, collectorId]) => tradeService.getTradeinfo(userId, collectorId)),
      share()
    );

    this.excludeUuids$ = tradeInfo$.pipe(
      map(({ selfCards }) => selfCards.map(({ id }) => id))
    );
  }

  public addCard(cardId: Id): void {
    this.registerSubscription(ConfirmationDialogComponent.open(this.matDialog, "Add Card?").pipe(
      filter(confirm => confirm === true),
      tap(() => this.loadingService.setLoading(true)),
      switchMap(() => observableCombineLatest([this.userId$, this.collectorId$])),
      switchMap(([userId, collectorId]) => this.tradeSelfInventoryService.addCard(userId, collectorId, cardId)),
      tap(() => this.loadingService.setLoading(false)),
    ).subscribe(() => {
      this.router.navigate([".."], { relativeTo: this.activatedRoute });
    }));
  }

  public closeAdd(): void {
    this.router.navigate([".."], { relativeTo: this.activatedRoute });
  }
}
