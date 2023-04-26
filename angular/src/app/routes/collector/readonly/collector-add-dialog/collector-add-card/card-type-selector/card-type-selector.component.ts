import { Component, Input, Output, EventEmitter } from '@angular/core'
import { BehaviorSubject, Observable, filter, combineLatest as observableCombineLatest, switchMap, startWith, map, distinctUntilChanged } from 'rxjs'

import { CardTypeSelectorService } from './card-type-selector.service';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';
import type { Id, CardType } from '../../../../../../shared/types';
import { FormControl } from '@angular/forms';

//TODO: some sort of validation something is set, and that the client cant put "invalid" values in the autocomplete text field
@Component({
	selector: 'cc-card-type-selector',
	templateUrl: './card-type-selector.component.html',
	styleUrls: [ './card-type-selector.component.scss' ]
})
export class CardTypeSelectorComponent extends SubscriptionManagerComponent {
	@Output()
	public readonly cardType: EventEmitter<CardType | null> = new EventEmitter<CardType | null>();

	public readonly formControl = new FormControl<string | CardType>('', {
		nonNullable: true
	});
	public readonly cardTypeOptions$: Observable<CardType[]>;

	private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
	private readonly collectorId$: Observable<Id>;
	@Input()
	public set collectorId(id: Id) {
		this.collectorIdSubject.next(id);
	}

	public get collectorId(): Id {
		const collectorId = this.collectorIdSubject.getValue();
		if(collectorId == null) throw new Error("collectorId not set");
		return collectorId;
	}

	constructor(private readonly cardTypeSelectorService: CardTypeSelectorService) {
		super();
		setTimeout(() => {
			this.formControl.setErrors({ invalidName: true });
			this.formControl.updateValueAndValidity();
		}, 0);

		this.collectorId$ = this.collectorIdSubject.asObservable().pipe(
			filter((collectorId): collectorId is Id => collectorId != null)
		);

		const formControlString = this.formControl.valueChanges.pipe(
			startWith(""),
			map(v => typeof v === "string" ? v : v.name),
			distinctUntilChanged()
		);

		this.cardTypeOptions$ = observableCombineLatest([this.collectorId$, formControlString]).pipe(
			switchMap(([collectorId, name]) => this.cardTypeSelectorService.getCardTypes(collectorId, name)),
			map(({ cardTypes }) => cardTypes)
		);

		this.registerSubscription(observableCombineLatest([formControlString, this.cardType.pipe(distinctUntilChanged())]).subscribe(([name, cardType]) => {
			if(cardType != null && name === cardType.name) {
				console.log("NO ERR");
				this.formControl.setErrors({ invalidName: null });
				this.formControl.updateValueAndValidity();
				return;
			}
			console.log("ERR");
			setTimeout(() => {
				this.formControl.markAsDirty();
				this.formControl.markAsTouched();
				this.formControl.setErrors({ invalidName: true });
				//this.formControl.updateValueAndValidity();
			}, 1);
			/* this.formControl.setErrors({ invalidName: true });
			this.formControl.updateValueAndValidity(); */
			this.cardType.next(null);
		}));
	}

	public onSelectionChange(cardType: CardType): void {
		this.cardType.next(cardType);
	}

	public displayFn(cardType: CardType): string {
		return cardType.name;
	}
}
