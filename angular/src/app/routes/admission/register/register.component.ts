import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { RegisterService } from './register.service';
import { AdmissionService } from '../admission-service';
import type { AdmissionConfig } from '../admission-service';

import { SubscriptionManagerComponent } from '../../../shared/abstract';
import { LoadingService } from '../../../shared/services';

@Component({
	selector: 'cc-register',
	templateUrl: './register.component.html',
	styleUrls: [ './register.component.scss' ],
})
export class RegisterComponent extends SubscriptionManagerComponent {
	public readonly formGroup;
	public readonly config: AdmissionConfig;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	private readonly passwordValidator: ValidatorFn = (fg: AbstractControl): ValidationErrors | null => {
		let password = fg.parent?.get("password")?.value;
		let passwordRepeat = fg.value;
		return password === passwordRepeat ? null : { passwordNotSame: true };
	};

	constructor(
		private readonly registerService: RegisterService,
		private readonly router: Router,
		private readonly admissionService: AdmissionService,
		private readonly loadingService: LoadingService
	) {
		super();
		this.config = this.admissionService.getConfig();
		this.formGroup = new FormGroup({
			username: new FormControl("", {
				nonNullable: true,
				validators: [
					Validators.required,
					//TODO: error in html
					Validators.pattern("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$"),
				]
			}),
			email: new FormControl("", {
				nonNullable: true,
				validators: [
					Validators.required,
					Validators.email
				]
			}),
			password: new FormControl("", {
				nonNullable: true,
				validators: [
					Validators.required
				]
			}),
			passwordRepeat: new FormControl("", [
				Validators.required,
				this.passwordValidator
			]),
		});

		this.error$ = this.errorSubject.asObservable();
	}

	public register(): void {
		const { passwordRepeat , ...config} = this.formGroup.getRawValue();

		this.registerSubscription(
			this.loadingService.waitFor(this.registerService.register(config)).subscribe({
				next: () => {
					this.router.navigate(["login"]);
				},
				error: (err: HttpErrorResponse) => {
					this.errorSubject.next(err.error?.error ?? "Register failed");
				}
			})
		);
	}
}
