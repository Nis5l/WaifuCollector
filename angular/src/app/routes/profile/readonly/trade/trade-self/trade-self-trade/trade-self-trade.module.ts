import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HttpModule } from '../../../../../../shared/services';
import { TradeSelfTradeComponent } from './trade-self-trade.component';
import { TradeSelfTradeService } from './trade-self-trade.service';

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
];

@NgModule({
  imports: [
    CommonModule,

    ...MATERIAL_MODULES,

    HttpModule
  ],
  providers: [ TradeSelfTradeService ],
  declarations: [ TradeSelfTradeComponent ]
})
export class TradeSelfTradeModule {}
