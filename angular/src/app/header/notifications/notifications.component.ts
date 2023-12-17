import { Component } from '@angular/core';
import { NotificationsService } from './notifications.service';

import { BehaviorSubject, Observable } from 'rxjs';

import { NotificationsListComponent } from './notifications-list';
import type { Notification } from './types';

import { PopupService } from '../../shared/services';
import { SubscriptionManagerComponent } from '../../shared/abstract';

//TODO: fix if notification are too long you can sroll
@Component({
  selector: 'cc-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ["./notifications.component.scss"]
})
export class NotificationsComponent extends SubscriptionManagerComponent {
	public readonly notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
	public readonly notifications$: Observable<Notification[]>;

	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly popupService: PopupService
	){
		super();
		this.notifications$ = this.notificationsSubject.asObservable();
	}

	ngOnInit(){
		this.registerSubscription(
			this.notificationsService.getNotifications().subscribe((notifications) => {
				this.notificationsSubject.next(notifications);
			})
		);
	}

	onClick(e: any){
		let width = 300;
		let height = 100;

		let pos = e.originalTarget.getBoundingClientRect();

		let x = pos.x - (width/2) - (pos.width / 2);
		let y = pos.y + pos.height + 10;

		this.popupService.openPopup(NotificationsListComponent, { x, y, width, height });
	}
}
