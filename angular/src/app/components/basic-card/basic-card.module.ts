import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasicCardComponent } from './basic-card.component';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [ BasicCardComponent ],
	exports: [ BasicCardComponent ]
})
export class BasicCardModule {}
