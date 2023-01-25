import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { LoginService } from './login.service';
import { AdmissionService } from '../admission-service';
import type { AdmissionConfig } from '../admission-service';

@Component({
	selector: "cc-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
	public readonly formGroup: FormGroup;
	public readonly config: AdmissionConfig;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(private readonly loginService: LoginService, private readonly router: Router, private readonly admissionService: AdmissionService) {
		this.config = this.admissionService.getConfig();
		this.formGroup = new FormGroup({
			username: new FormControl("", [
				Validators.required,
				Validators.minLength(this.config.username.minLength),
				Validators.maxLength(this.config.username.maxLength)
			]),
			password: new FormControl("", [
				Validators.required,
				Validators.minLength(this.config.password.minLength),
				Validators.maxLength(this.config.password.maxLength)
			]),
		});

		this.error$ = this.errorSubject.asObservable();
	}

	public login(): void {
		this.loginService.login(this.formGroup.value).subscribe({
			next: () => {
				this.errorSubject.next(null);
				this.router.navigate(["collectors"]);
			},
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Login failed");
			}
		});
	}
}
