import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HttpService } from '../../../http-service';
import { AuthService } from '../../../auth-service';

import type { LoginRequest, LoginResponse } from './types';

@Injectable()
export class LoginService {
	constructor(private readonly httpService: HttpService, private readonly authService: AuthService) {}

	public login(body: LoginRequest): Observable<LoginResponse> {
		return this.httpService.post<LoginRequest, LoginResponse>("/login", body, { withCredentials: true }).pipe(
			tap((res: LoginResponse) => {
				this.authService.login(res);
			})
		);
	}
}
