import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import type { Id } from '../../types';

import type { Notification } from './types';


@Injectable()
export class NotificationsService {
	constructor(private httpService: HttpService){}

	public getNotifications(): Observable<Notification[]>{
		return this.httpService.get('/notifications');
	}
}
