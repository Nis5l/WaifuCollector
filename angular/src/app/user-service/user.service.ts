import { Injectable } from '@angular/core';
import { Observable, of as observableOf, map } from 'rxjs';

import { UsernameResponse } from './types';
import { HttpService } from '../http-service';
import { AuthService  } from '../auth-service';

@Injectable()
export class UserService {
	constructor(private readonly httpService: HttpService, private readonly authService: AuthService) {}

	public getUsername(): Observable<string | null> {
		const userId = this.authService.getUserId();
		if(userId == null) return observableOf(null);
		console.log(userId);
		return this.httpService.get<UsernameResponse>(`/user/${userId}/username`).pipe(
			map((res: UsernameResponse): string => res.username)
		);
	}
}
