import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import type { Profile } from './types';
import type { Id } from '../../types';

@Injectable()
export class ProfileService {
	constructor(private readonly httpService: HttpService) {}

	public getProfile(userId: Id): Observable<Profile> {
		return this.httpService.get(`/user/${userId}/stats`);
	}
}
