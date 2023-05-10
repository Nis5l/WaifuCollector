import { Component, Input, Output, EventEmitter, forwardRef, Injector, AfterViewInit } from '@angular/core'
import { BehaviorSubject, Observable, filter, combineLatest as observableCombineLatest, switchMap, startWith, map, distinctUntilChanged } from 'rxjs'

import { CardTypeSelectorService } from './card-type-selector.service';
import { SubscriptionManagerComponent } from '../../../../../../shared/abstract';
import type { Id, CardType } from '../../../../../../shared/types';
import { ControlValueAccessor, FormControl, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'cc-card-type-selector',
	templateUrl: './card-type-selector.component.html',
	styleUrls: [ './card-type-selector.component.scss' ],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: forwardRef(() => CardTypeSelectorComponent)
		}
	]
})
export class CardTypeSelectorComponent extends SubscriptionManagerComponent implements ControlValueAccessor, AfterViewInit {
	@Output()
	public readonly cardType: EventEmitter<CardType | null> = new EventEmitter<CardType | null>();

	public readonly formControl = new FormControl<string | CardType>('', {
		nonNullable: true
	});
	public control: FormControl | null = null;
	public readonly cardTypeOptions$: Observable<CardType[]>;

	private onChange = (cardType: CardType | null) => {};
	private onTouched = () => {};
	private touched: boolean = false;
	public disabled: boolean = false;

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

	constructor(private injector: Injector, private readonly cardTypeSelectorService: CardTypeSelectorService) {
		super();
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
			if(cardType != null && name !== cardType.name) {
				this.cardType.next(null);
			}
		}));
		this.registerSubscription(this.cardType.pipe(distinctUntilChanged()).subscribe(cardType => {
			this.onChange(cardType);
		}));
	}

	ngAfterViewInit(): void {
		const ngControl: NgControl | null = this.injector.get(NgControl, null);
		if (ngControl) {
			this.control = ngControl.control as FormControl;
		}
	}

	public onSelectionChange(cardType: CardType): void {
		this.cardType.next(cardType);
	}

	public displayFn(cardType: CardType): string {
		return cardType.name;
	}

	writeValue(cardType: CardType) {
		this.cardType.next(cardType);
	}

	registerOnChange(onChange: any) {
		this.onChange = onChange;
	}

	registerOnTouched(onTouched: any) {
		this.onTouched = onTouched;
	}

	markAsTouched() {
		if (!this.touched) {
		  this.onTouched();
		  this.touched = true;
		}
	}

	setDisabledState(disabled: boolean) {
		this.disabled = disabled;
	}
}
