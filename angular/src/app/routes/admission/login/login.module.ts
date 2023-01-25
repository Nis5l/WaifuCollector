import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { HttpModule } from '../../../http-service';
import { AdmissionModule } from '../admission-service';
import { AuthModule } from '../../../auth-service';
import { NgVarModule } from '../../../directives';

const MATERIAL_MODULES = [
	MatFormFieldModule,
	MatInputModule,
	MatButtonModule,
	MatCardModule,
];

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterModule,

		...MATERIAL_MODULES,

		NgVarModule,
		HttpModule,
		AuthModule,
		AdmissionModule,
	],	
	declarations: [ LoginComponent ],
	providers: [
		LoginService
	],
})
export class LoginModule {}
