import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Collector, Id } from '../../types';
import { HttpService } from '../../http-service';

@Injectable()
export class CollectorService {
	constructor(private readonly httpService: HttpService) {}

	public getCollector(collectorId: Id): Observable<Collector> {
		return this.httpService.get(`/collector/${collectorId}`);
	}
}
