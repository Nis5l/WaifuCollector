import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TradeSelfTradeService } from './trade-self-trade.service';

@Component({
  selector: "cc-trade-self-trade",
  templateUrl: "./trade-self-trade.component.html",
  styleUrls: [  "././trade-self-trade.component.scss" ]
})
export class TradeSelfTradeComponent {
  constructor(
    private readonly tradeSelfTradeService: TradeSelfTradeService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) {}

  public openAddCard(): void {
    this.router.navigate(["inventory"], { relativeTo: this.activatedRoute });
  }
}
