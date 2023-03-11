import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpModule } from '../../../../http-service';

import { CollectorOpenService } from './collector-open.service';
import { CollectorOpenComponent } from './collector-open.component';

@NgModule({
imports: [
	HttpModule,
	CommonModule,
],
providers: [ CollectorOpenService ],
declarations: [ CollectorOpenComponent ],
exports: [ CollectorOpenComponent ]
})
export class CollectorOpenModule {}
