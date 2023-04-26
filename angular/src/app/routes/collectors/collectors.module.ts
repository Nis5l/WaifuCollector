import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { HttpModule } from '../../shared/services';
import { NgVarModule } from '../../shared/directives';
import { LoadingSpinnerModule } from '../../shared/services/loading';
import { CollectorModule } from './collector';
import { NewCollectorDialogModule } from './new-collector-dialog';

import { CollectorsComponent } from './collectors.component';
import { CollectorsService } from './collectors.service';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
	MatDialogModule,
	MatPaginatorModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,

		...MATERIAL_MODULES,

		NgVarModule,
		HttpModule,
		CollectorModule,
		LoadingSpinnerModule,
		NewCollectorDialogModule,
	],
	providers: [ CollectorsService ],
	declarations: [ CollectorsComponent ],
})
export class CollectorsModule {}
