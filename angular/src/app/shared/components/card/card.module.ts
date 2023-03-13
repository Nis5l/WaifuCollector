import { NgModule } from '@angular/core';

import { CardComponent } from './card.component';
import { CardService } from './card.service';
import { HttpModule } from '../../services';

@NgModule({
	imports: [ HttpModule ],
	providers: [ CardService ],
	declarations: [ CardComponent ],
	exports: [ CardComponent ],
})
export class CardModule {}