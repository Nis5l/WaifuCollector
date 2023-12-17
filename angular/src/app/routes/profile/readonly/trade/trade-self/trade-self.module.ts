import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TradeSelfComponent } from './trade-self.component';
import { CardModule, LoadingModule } from '../../../../../shared/components';
import { NgVarModule } from '../../../../../shared/directives';
import { LoadingService } from '../../../../../shared/services';
import { TradeSelfInventoryModule } from './trade-self-inventory';
import { TradeSelfTradeModule } from './trade-self-trade';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    CardModule,
    NgVarModule,
    LoadingModule,
    TradeSelfInventoryModule,
    TradeSelfTradeModule,
  ],
  //TODO: split for self and friend
  providers: [ LoadingService ],
  declarations: [ TradeSelfComponent ]
})
export class TradeSelfModule {}
