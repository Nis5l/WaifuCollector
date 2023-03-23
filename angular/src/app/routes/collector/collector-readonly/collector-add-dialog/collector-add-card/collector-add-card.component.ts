import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import type { CardData, Id } from '../../../../../shared/types';
import { HttpService } from '../../../../../shared/services';
import { eventGetImage } from '../../../../../shared/utils';

@Component({
	selector: "cc-collector-add-card",
	templateUrl: "./collector-add-card.component.html",
	styleUrls: [ "./collector-add-card.component.scss" ]
})
export class CollectorAddCardComponent {
	private _collectorId: Id | null = null;
	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
	}

	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	private readonly imageSubject: Subject<SafeResourceUrl> = new Subject<SafeResourceUrl>();
	private readonly cardSubject: BehaviorSubject<CardData> = new BehaviorSubject<CardData>({
		cardEffect: {
			id: 0,
			image: this.httpService.apiUrl("/effect/Effect1.gif"),
			opacity: 1.0,
		},
		cardFrame: {
			id: 0,
			back: this.httpService.apiUrl("/frame/Frame_Silver_Back.png"),
			front: this.httpService.apiUrl("/frame/Frame_Silver_Front.png"),
			name: "frame"
		},
		cardInfo: {
			id: "id",
			name: "",
			image: this.httpService.apiUrl("/card/card-image"),
		},
		cardType: {
			id: "id",
			name: "type"
		}
	});

	public readonly card$: Observable<CardData>;

	public readonly formGroup;

	constructor(
		private readonly httpService: HttpService,
		private readonly domSanitizer: DomSanitizer,
	) {
		this.formGroup = new FormGroup({
			name: new FormControl("", {
				nonNullable: true,
				validators: [ Validators.required ],
			})
		});

		this.formGroup.valueChanges.subscribe(value => {
			const current = this.cardSubject.getValue();
			this.cardSubject.next({
				...current,
				cardInfo: {
					...current.cardInfo,
					name: value.name ?? current.cardInfo.name
				}
			});
		});

		this.card$ = this.cardSubject.asObservable();
	}

	public imageChange(target: EventTarget | null): void {
		const image = eventGetImage(target);

		const blobUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(image));
		this.imageSubject.next(blobUrl);
	}
}
