import { Component, Input } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { CollectorFavoriteService } from './collector-favorite.service';
import type { Id } from '../../../../types';
import type { CollectorFavoriteResponse } from './types';

import { BaseComponent } from '../../../../base-component';

@Component({
	selector: "cc-collector-favorite",
	templateUrl: "./collector-favorite.component.html",
	styleUrls: [ "./collector-favorite.component.scss" ]
})
export class CollectorFavoriteComponent extends BaseComponent {
	private _collectorId: Id | null = null;
	private readonly collectorFavoriteSubject: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
	public readonly collectorFavorite$: Observable<boolean>;

	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
		this.registerSubscription(
			this.collectorFavoriteService.getFavorite(this._collectorId).subscribe((response: CollectorFavoriteResponse) => {
				this.collectorFavoriteSubject.next(response.favorite);
			})
		);
	}
	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	constructor(private readonly collectorFavoriteService : CollectorFavoriteService) {
		super();
		this.collectorFavorite$ = this.collectorFavoriteSubject.asObservable();
	}

	public setFavorite(value: boolean){
		if(this._collectorId == null) return;
		let observable: Observable<unknown> = value ? this.collectorFavoriteService.addFavorite(this._collectorId) : this.collectorFavoriteService.removeFavorite(this._collectorId);
		this.registerSubscription(
			observable.subscribe(_res => {
				this.collectorFavoriteSubject.next(value);
			})
		);
	}
}
