import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError as observableThrowError } from 'rxjs';

import { AuthService } from '../auth-service';

interface Headers {
	[key: string]: string
}

@Injectable()
export class HttpService {
	private readonly api = "http://127.0.0.1:8080";
	private readonly headers: Headers = {
		'Content-Type': 'application/json',
	};
	
	constructor(
		private readonly httpClient: HttpClient,
		private readonly router: Router,
		private readonly authService: AuthService
	) {}

	public get<TRes>(url: string): Observable<TRes> {
		const headers = this.getHeaders();

		return this.httpClient.get<TRes>(`${this.api}${url}`, { headers } ).pipe(
			catchError(this.catchTokenError<TRes>())
		);
	}

	public post<TBody, TRes>(url: string, body: TBody): Observable<TRes> {
		const headers = this.getHeaders();

		return this.httpClient.post<TRes>(`${this.api}${url}`, body, { headers }).pipe(
			catchError(this.catchTokenError<TRes>())
		);
	}

	public delete<TRes>(url: string): Observable<TRes> {
		const headers = this.getHeaders();

		return this.httpClient.delete<TRes>(`${this.api}${url}`, { headers }).pipe(
			catchError(this.catchTokenError<TRes>())
		);
	}

	private getHeaders(): Headers {
		const accessToken = this.authService.getAccessToken();

		let headers = { ...this.headers};
		if(accessToken != null) headers = { ...headers, Authorization: `Bearer ${accessToken}` };

		return headers;
	}

	private catchTokenError<TRes>(): (err: HttpErrorResponse) => Observable<TRes> {
		return (err: HttpErrorResponse) => {
			if(err.status == 401)
				this.router.navigate(["login"]);

			return observableThrowError(() => err);
		}
	}
}
