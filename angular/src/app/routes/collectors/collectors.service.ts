import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import type { Collector } from './collector';

@Injectable()
export class CollectorsService {
	constructor(private readonly httpService: HttpService) {}

	public getCollectors(): Observable<Collector[]> {
		return this.httpService.get("/collector/list");
	}
}
