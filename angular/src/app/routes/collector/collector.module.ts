import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CollectorComponent } from './collector.component';
import { CollectorService } from './collector.service';
import { HttpModule } from '../../http-service';
import { NgVarModule } from '../../directives';
import { CollectorImageModule } from './collector-image';
import { CollectorFavoriteModule } from './collector-favorite';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		RouterModule,
			
		CollectorImageModule,
		CollectorFavoriteModule,
		NgVarModule
	],
	providers: [ CollectorService ],
	declarations: [ CollectorComponent ],
})
export class CollectorModule {}
