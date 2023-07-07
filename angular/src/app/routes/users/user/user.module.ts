import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { UserComponent } from './user.component';
import { ProfileImageModule } from '../../../shared/components';

const MATERIAL_MODULES = [
	MatCardModule
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

		...MATERIAL_MODULES,

    ProfileImageModule,
  ],
  declarations: [ UserComponent ],
  exports: [ UserComponent ],
})
export class UserModule {}
