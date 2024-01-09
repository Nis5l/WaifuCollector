import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, switchMap, share, combineLatest as observableCombineLatest, Subject, startWith, filter, tap } from 'rxjs';

import { TradeService } from '../../trade.service';
import type { TradeInfoResponse } from '../../types';
import type { Id, UnlockedCard } from '../../../../../../shared/types';
import { ConfirmationDialogComponent } from '../../../../../../shared/dialogs';
import { LoadingService } from '../../../../../../shared/services';
import { TradeSelfTradeService } from './trade-self-trade.service';

@Component({
  selector: "cc-trade-self-trade",
  templateUrl: "./trade-self-trade.component.html",
  styleUrls: [  "././trade-self-trade.component.scss" ]
})
export class TradeSelfTradeComponent {
  //TODO: split for self and friend
  public readonly tradeInfo$: Observable<TradeInfoResponse>;
  private readonly reloadCards: Subject<void> = new Subject<void>();
  private readonly userId$: Observable<Id>;
  private readonly collectorId$: Observable<Id>;

  constructor(
    private readonly tradeService: TradeService,
    private readonly tradeSelfTradeService: TradeSelfTradeService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly matDialog: MatDialog,
    private readonly loadingService: LoadingService
  ) {
    const params$ = activatedRoute.parent?.parent?.params ?? activatedRoute.params;

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

    this.tradeInfo$ = observableCombineLatest([this.userId$, this.collectorId$, this.reloadCards.pipe(startWith(undefined))]).pipe(
      switchMap(([userId, collectorId]) => this.tradeService.getTradeinfo(userId, collectorId)),
      share()
    );
  }

  public openAddCard(): void {
    this.router.navigate(["inventory"], { relativeTo: this.activatedRoute });
  }

  public removeCard({ id: cardId }: UnlockedCard): void {
    ConfirmationDialogComponent.open(this.matDialog, "Remove Card?").pipe(
      filter(confirm => confirm === true),
      tap(() => this.loadingService.setLoading(true)),
      switchMap(() => observableCombineLatest([this.userId$, this.collectorId$])),
      switchMap(([userId, collectorId]) => this.tradeSelfTradeService.removeCard(userId, collectorId, cardId)),
      tap(() => this.loadingService.setLoading(false)),
    ).subscribe(() => {
        this.reloadCards.next();
    });
  }
}
