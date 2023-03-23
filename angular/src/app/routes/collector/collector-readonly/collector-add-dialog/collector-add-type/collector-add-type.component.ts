import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import type { Id } from '../../../../../shared/types';

@Component({
	selector: 'cc-collector-add-type',
	templateUrl: './collector-add-type.component.html',
	styleUrls: [ './collector-add-type.component.scss' ],
})
export class CollectorAddTypeComponent {
	private _collectorId: Id | null = null;
	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
	}

	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	public readonly formGroup;

	constructor() {
		this.formGroup = new FormGroup({
			name: new FormControl("", {
				nonNullable: true,
				validators: [ Validators.required ]
			})
		});
	}

	public createType(): void {
		
	}
}
