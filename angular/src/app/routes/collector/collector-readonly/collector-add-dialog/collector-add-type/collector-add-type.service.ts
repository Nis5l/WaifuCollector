import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../../shared/services';
import type { Id } from '../../../../../shared/types';
import { CollectorTypeConfig, CollectorTypeRequestResponse, CollectorTypeRequestRequest } from './types';

@Injectable()
export class CollectorAddTypeService {
	constructor(private readonly httpService: HttpService) {}

	public getConfig(): Observable<CollectorTypeConfig> {
		return this.httpService.get<CollectorTypeConfig>("/card-type/config");
	}

	public createCollectorRequest(collector_id: Id, data: CollectorTypeRequestRequest): Observable<CollectorTypeRequestResponse> {
		return this.httpService.post<CollectorTypeRequestRequest, CollectorTypeRequestResponse>(`/${collector_id}/card-type/request`, data);
	}
}
