import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../shared/services';
import type { Id } from '../../shared/types';
import type { Profile, FriendStatusResponse } from './shared';

@Injectable()
export class ProfileService {
	constructor(private readonly httpService: HttpService) {}

	public getProfile(userId: Id): Observable<Profile> {
		return this.httpService.get(`/user/${userId}/stats`);
	}

  public friendStatus(userId: Id): Observable<FriendStatusResponse> {
    return this.httpService.get<FriendStatusResponse>(`/friend/${userId}/status`);
  }

  public addFriend(userId: Id): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/friend/${userId}/add`, {});
  }

  public removeFriend(userId: Id): Observable<unknown> {
    return this.httpService.post<{}, unknown>(`/friend/${userId}/remove`, {});
  }
}
