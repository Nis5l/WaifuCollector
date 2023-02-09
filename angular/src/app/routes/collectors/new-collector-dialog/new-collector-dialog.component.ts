import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

import { NewCollectorDialogService } from './new-collector-dialog.service';
import type { NewCollectorConfig } from './types';
import { LoadingService } from '../../../loading';
import type { Id } from '../../../types';

@Component({
	selector: "cc-new-collector-dialog",
	templateUrl: "./new-collector-dialog.component.html",
	styleUrls: [ "./new-collector-dialog.component.scss" ]
})
export class NewCollectorDialogComponent {
	private image: File | null = null;
	public formGroup;
	public config: NewCollectorConfig;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	public loading$: Observable<boolean>;

	constructor(
		public readonly newCollectorDialogService: NewCollectorDialogService,
		private readonly dialogRef: MatDialogRef<NewCollectorDialogComponent>,
		private readonly loadingService: LoadingService,
		private readonly router: Router,
	) {
		this.error$ = this.errorSubject.asObservable();

		this.config = this.newCollectorDialogService.getConfig();
		this.formGroup = new FormGroup({
			name: new FormControl("", {
				nonNullable: true,
				validators: [ Validators.required, Validators.minLength(this.config.name.minLength), Validators.maxLength(this.config.name.maxLength) ]
			})
		});

		this.loading$ = this.newCollectorDialogService.loading();
		this.loading$.subscribe(() => {
			this.config = this.newCollectorDialogService.getConfig();
			this.formGroup = new FormGroup({
				name: new FormControl("", {
					nonNullable: true,
					validators: [ Validators.required, Validators.minLength(this.config.name.minLength), Validators.maxLength(this.config.name.maxLength) ]
				})
			});
		});
	}

	public onCreate(): void {
		const redirect = (id: Id) => this.router.navigate(["collector", id]);
		this.newCollectorDialogService.createCollector(this.formGroup.getRawValue()).subscribe({
			next: res => {
				this.errorSubject.next(null);
				const id = res.id;
				if(this.image == null) {
					redirect(id);
					return;
				}
				this.loadingService.waitFor(this.newCollectorDialogService.setCollectorImage(id, this.image)).subscribe({
					error: () => redirect(id),
					next: () => redirect(id)
				})
			},
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Creating collector failed");
			}
		});
	}

	public imageChange(image: File): void {
		this.image = image;
	}
}
