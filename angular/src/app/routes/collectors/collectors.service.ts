import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import type { Id } from '../../types';
import type { Collector } from './collector';
import type { CollectorCreateRequest, CollectorCreateResponse } from './types';

@Injectable()
export class CollectorsService {
	constructor(private readonly httpService: HttpService) {}

	public getCollectors(search: string, page: number): Observable<Collector[]> {
		const params = new HttpParams().set('search', search).set('page', page);

		return this.httpService.get("/collector", params);
	}

	public createCollector(data: CollectorCreateRequest): Observable<CollectorCreateResponse> {
		return this.httpService.post<CollectorCreateRequest, CollectorCreateResponse>("/collector/create", data);
	}

	public setCollectorImage(collectorId: Id, image: File): Observable<void> {
		return this.httpService.putFile<void>(`/collector/${collectorId}/collector-image`, image);
	}
}
