import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../shared/services';
import type { Collector } from './collector';

@Injectable()
export class CollectorsService {
	constructor(private readonly httpService: HttpService) {}

	public getCollectors(search: string, page: number): Observable<Collector[]> {
		const params = new HttpParams().set('search', search).set('page', page);

		return this.httpService.get("/collector", params);
	}
}
