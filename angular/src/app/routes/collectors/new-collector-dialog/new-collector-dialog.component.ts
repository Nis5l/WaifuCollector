import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NewCollectorDialogService } from './new-collector-dialog.service';
import type { NewCollectorConfig, NewCollector } from './types';

@Component({
	selector: "cc-new-collector-dialog",
	templateUrl: "./new-collector-dialog.component.html",
	styleUrls: [ "./new-collector-dialog.component.scss" ]
})
export class NewCollectorDialogComponent {
	private image: File | null = null;
	public readonly formGroup: FormGroup;
	public readonly config: NewCollectorConfig;

	constructor(
		public readonly newCollectorDialogService: NewCollectorDialogService,
		private readonly dialogRef: MatDialogRef<NewCollectorDialogComponent>,
	) {
		this.config = this.newCollectorDialogService.getConfig();
		this.formGroup = new FormGroup({
			name: new FormControl("", [Validators.required, Validators.minLength(this.config.name.minLength), Validators.maxLength(this.config.name.maxLength)])
		});
	}

	public onCreate(): void {
		const data: NewCollector = {
			...this.formGroup.value,
			image: this.image
		};
		this.dialogRef.close(data);
	}

	public imageChange(image: File): void {
		this.image = image;
	}
}
