import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, share, BehaviorSubject } from 'rxjs';

import { CollectorAddTypeService } from './collector-add-type.service';
import type { CollectorTypeConfig } from './types';
import type { Id } from '../../../../../shared/types';
import { LoadingService } from '../../../../../shared/services';
import { HttpErrorResponse } from '@angular/common/http';

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

	public readonly config$: Observable<CollectorTypeConfig>;
	public readonly formGroup;

	private readonly errorSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly error$: Observable<string | null>;

	constructor(private readonly collectorAddTypeService: CollectorAddTypeService, private readonly loadingService: LoadingService) {
		this.formGroup = new FormGroup({
			name: new FormControl("", {
				nonNullable: true,
				validators: [ Validators.required, Validators.pattern("^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$") ]
			})
		});

		this.config$ = this.collectorAddTypeService.getConfig().pipe(share());
		this.error$ = this.errorSubject.asObservable();
	}

	public createTypeRequest(): void {
		console.log("TEST");
		this.loadingService.waitFor(this.collectorAddTypeService.createCollectorRequest(this.collectorId, this.formGroup.getRawValue())).subscribe({
			next: () => { /* TODO: goto created request */},
			error: (err: HttpErrorResponse) => {
				this.errorSubject.next(err.error?.error ?? "Creating type failed");
			}
		})
	}
}
