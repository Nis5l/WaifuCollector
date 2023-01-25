import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

import type { Id } from '../types';
import type { AuthData } from './types';

@Injectable()
export class AuthService {
	private readonly loggedInSubject: BehaviorSubject<AuthData | null> = new BehaviorSubject<AuthData | null>(null);

	constructor() {
		const accessToken = localStorage.getItem("access-token");
		const userId = localStorage.getItem("user-id");

		this.loggedInSubject.next(
			accessToken != null && userId != null ? { userId, accessToken } : null
		);
	}

	public logout(): void {
		["access-token", "user-id"].forEach(k => localStorage.removeItem(k));
		this.loggedInSubject.next(null);
	}

	public login(authData: AuthData): void {
		localStorage.setItem("access-token", authData.accessToken);
		localStorage.setItem("user-id", authData.userId);
		this.loggedInSubject.next(authData);
	}

	public loggedIn(): Observable<boolean> {
		return this.loggedInSubject.asObservable().pipe(map(id => id != null));
	}

	public getUserId(): Id | null {
		return this.loggedInSubject.getValue()?.userId ?? null;
	}

	public getAccessToken(): Id | null {
		return this.loggedInSubject.getValue()?.accessToken ?? null;
	}
}
