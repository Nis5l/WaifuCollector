import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { CollectorInventoryComponent } from './collector-inventory.component';
import { CollectorInventoryService } from './collector-inventory.service';
import { HttpModule } from '../../../../shared/services';
import { CardModule, LoadingModule } from '../../../../shared/components';
import { NgVarModule } from '../../../../shared/directives';

const MATERIAL_MODULES = [
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
];

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,

    ...MATERIAL_MODULES,

    HttpModule,
    NgVarModule,
    CardModule,
    LoadingModule,
  ],
  providers: [ CollectorInventoryService ],
  declarations: [ CollectorInventoryComponent ],
})
export class CollectorInventoryModule {}
