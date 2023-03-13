import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../shared/services';

import type { Notification } from './types';


@Injectable()
export class NotificationsService {
	constructor(private httpService: HttpService){}

	public getNotifications(): Observable<Notification[]>{
		return this.httpService.get('/notifications');
	}
}
