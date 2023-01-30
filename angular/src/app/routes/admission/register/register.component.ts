import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import type { RegisterRequest } from './types';
import { RegisterService } from './register.service';
import { AdmissionService } from '../admission-service';
import type { AdmissionConfig } from '../admission-service';

@Component({
	selector: 'cc-register',
	templateUrl: './register.component.html',
	styleUrls: [ './register.component.scss' ],
})
export class RegisterComponent {
	public readonly formGroup: UntypedFormGroup;
	public readonly config: AdmissionConfig;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	private readonly passwordValidator: ValidatorFn = (fg: AbstractControl): ValidationErrors | null => {
		let password = fg.get("password")?.value;
		let passwordRepeat = fg.get("passwordRepeat")?.value;
		return password === passwordRepeat ? null : { notSame: true };
	};

	constructor(private readonly registerService: RegisterService, private readonly router: Router, private readonly admissionService: AdmissionService) {
		this.config = this.admissionService.getConfig();
		this.formGroup = new UntypedFormGroup({
			username: new UntypedFormControl("", [
				Validators.required,
				Validators.minLength(this.config.username.minLength),
				Validators.maxLength(this.config.username.maxLength)
			]),
			email: new UntypedFormControl("", [
				Validators.required,
				Validators.email
			]),
			password: new UntypedFormControl("", [
				Validators.required,
				Validators.minLength(this.config.password.minLength),
				Validators.maxLength(this.config.password.maxLength)
			]),
			passwordRepeat: new UntypedFormControl("", [
				Validators.required,
			]),
		}, { validators: this.passwordValidator });

		this.error$ = this.errorSubject.asObservable();
	}

	public register(): void {
		const { passwordRepeat , ...config} = this.formGroup.value as RegisterRequest & { passwordRepeat: string };

		this.registerService.register(config).subscribe({
			next: () => {
				this.router.navigate(["login"]);
			},
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Register failed");
			}
		});
	}
}
