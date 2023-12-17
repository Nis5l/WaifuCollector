import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeFriendComponent } from './trade-friend.component';
import { CardModule } from '../../../../../shared/components';

@NgModule({
  imports: [
    CommonModule,
    CardModule,
  ],
  declarations: [ TradeFriendComponent ]
})
export class TradeFriendModule {}
