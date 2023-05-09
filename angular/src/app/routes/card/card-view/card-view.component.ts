import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';

import type { Id } from '../../../shared/types';

@Component({
	selector: 'cc-card-view',
	templateUrl: "./card-view.component.html",
	styleUrls: [ "./card-view.component.scss" ],
})
export class CardViewComponent {
	public readonly cardId$: Observable<Id>;

	public constructor(private readonly activatedRoute: ActivatedRoute) {
		this.cardId$ = this.activatedRoute.params.pipe(
			map(params => {
				const cardId: unknown = params["cardId"] as unknown;
				if(typeof cardId !== "string") throw new Error("cardId not set");
				return cardId;
			})
		);
	}
}
