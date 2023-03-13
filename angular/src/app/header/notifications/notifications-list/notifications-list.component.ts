import { Component } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { Popup } from '../../../shared/services/popup';

import { Notification } from '../types';
import { NotificationsService } from '../notifications.service';

@Component({
	selector: 'cc-notifications-list',
	templateUrl: './notifications-list.component.html',
	styleUrls: ["./notifications-list.component.scss"]
})
export class NotificationsListComponent implements Popup {
	private readonly notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
	public readonly notifications$: Observable<Notification[]>;

	constructor(
		private notificationsService: NotificationsService
	){
		this.notifications$ = this.notificationsSubject.asObservable();
	}

	public onOpen(){
		this.notificationsService.getNotifications().subscribe((notifications: Notification[]) => {
			this.notificationsSubject.next(notifications);
		});
	}

	public onClose(){
	}
}
