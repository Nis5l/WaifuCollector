import { NgModule } from '@angular/core';

import { CardComponent } from './card.component';
import { CardService } from './card.service';
import { HttpModule } from '../../http-service';

@NgModule({
	imports: [ HttpModule ],
	providers: [ CardService ],
	declarations: [ CardComponent ],
	exports: [ CardComponent ],
})
export class CardModule {}
