import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TradeService } from './trade.service';
import { TradeComponent } from './trade.component';
import { HttpModule } from '../../../../shared/services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    HttpModule
  ],
  providers: [ TradeService ],
  declarations: [ TradeComponent ],
})
export class TradeModule {}
