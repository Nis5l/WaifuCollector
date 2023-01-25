import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Card } from './types';
import { HttpService } from '../http-service';

@Injectable()
export class CardService {
	constructor(private readonly httpService: HttpService) {}

	public getCard(id: string): Observable<Card> {
		return this.httpService.get(`/card/${id}`);
	}
}
