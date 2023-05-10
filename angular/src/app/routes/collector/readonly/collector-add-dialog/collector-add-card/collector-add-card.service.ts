import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { CollectorAddCardConfig } from './types';

@Injectable()
export class CollectorAddCardService {
	constructor(private readonly httpService: HttpService) {}

	public getConfig(): Observable<CollectorAddCardConfig> {
		return this.httpService.get<CollectorAddCardConfig>("/card/config");
	}
}
