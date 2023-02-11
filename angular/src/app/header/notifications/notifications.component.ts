import { Component } from '@angular/core';
import { NotificationsService } from './notifications.service';

import { BehaviorSubject, Observable } from 'rxjs';

import type { Notification } from './types';

@Component({
  selector: 'cc-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ["./notifications.component.scss"]
})
export class NotificationsComponent {
	public readonly notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
	public readonly notifications$: Observable<Notification[]>;

	constructor(
		private readonly notificationsService: NotificationsService
	){
		this.notifications$ = this.notificationsSubject.asObservable();
	}

	ngOnInit(){
		this.notificationsService.getNotifications().subscribe((notifications) => {
			this.notificationsSubject.next(notifications);
		});
	}
}
