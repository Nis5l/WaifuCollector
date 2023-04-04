import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../../shared/services';
import type { Id, CardType } from '../../../shared/types';

@Injectable()
export class CollectorReadonlyService {
	constructor(private readonly httpService: HttpService) {}

	public indexCardTypes(collectorId: Id, name: string, page: number): Observable<CardType[]> {
		const params = new HttpParams().set('name', name).set('page', page);
		return this.httpService.get(`/${collectorId}/card-type`, params);
	}
}
