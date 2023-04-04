import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, filter, switchMap } from 'rxjs';

import type { Id } from '../../../../../../shared/types';
import { UserService } from '../../../../../../shared/services';

@Component({
	selector: 'cc-request-card',
	templateUrl: './request-card.component.html',
	styleUrls: [ './request-card.component.scss' ]
})
export class RequestCardComponent {
	public readonly isAdmin$: Observable<boolean>;

	public readonly userId$: Observable<Id>;
	public readonly collectorId$: Observable<Id>;
	private readonly userIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
	private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);

	@Input()
	public set collectorId(id: Id) {
		this.collectorIdSubject.next(id);
	}
	public get collectorId(): Id {
		const collectorId = this.collectorIdSubject.getValue();
		if(collectorId == null) throw new Error("collectorId not set");
		return collectorId;
	}

	@Input()
	public set userId(id: Id | null | undefined) {
		if(id == null) return;
		this.userIdSubject.next(id);
	}
	public get userId(): Id {
		const userId = this.userIdSubject.getValue();
		if(userId == null) throw new Error("userId not set");
		return userId;
	}

	@Input()
	public title: string = "UNSET";

	constructor(private readonly userService: UserService) {
		this.userId$ = this.userIdSubject.asObservable().pipe(filter((userId): userId is Id => userId != null));
		this.collectorId$ = this.collectorIdSubject.asObservable().pipe(filter((collectorId): collectorId is Id => collectorId != null));

		this.isAdmin$ = this.collectorId$.pipe(
			switchMap(collectorId => this.userService.isCollectorAdmin(collectorId))
		);
	}
}
