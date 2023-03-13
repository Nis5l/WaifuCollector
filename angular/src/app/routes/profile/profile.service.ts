import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../shared/services';
import type { Id } from '../../shared/types';
import type { Profile } from './shared';

@Injectable()
export class ProfileService {
	constructor(private readonly httpService: HttpService) {}

	public getProfile(userId: Id): Observable<Profile> {
		return this.httpService.get(`/user/${userId}/stats`);
	}
}
