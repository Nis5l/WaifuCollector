import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { LoadingModule, CardModule } from '../../../../../../shared/components';
import { ConfirmationDialogModule } from '../../../../../../shared/dialogs';
import { NgVarModule } from '../../../../../../shared/directives';
import { HttpModule } from '../../../../../../shared/services';
import { TradeSelfTradeComponent } from './trade-self-trade.component';
import { TradeSelfTradeService } from './trade-self-trade.service';

const MATERIAL_MODULES = [
  MatDialogModule,
	MatButtonModule,
	MatIconModule,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    ...MATERIAL_MODULES,

    HttpModule,
    LoadingModule,
    CardModule,
    NgVarModule,
    ConfirmationDialogModule,
  ],
  providers: [ TradeSelfTradeService ],
  declarations: [ TradeSelfTradeComponent ]
})
export class TradeSelfTradeModule {}
