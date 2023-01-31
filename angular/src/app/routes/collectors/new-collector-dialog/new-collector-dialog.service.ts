import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../http-service';
import { Id } from '../../../types';
import type { NewCollectorConfig, CollectorCreateResponse, CollectorCreateRequest } from './types';

@Injectable()
export class NewCollectorDialogService {
	//TODO: get from server
	private readonly config: NewCollectorConfig = {
		name: {
			minLength: 4,
			maxLength: 20
		}
	};

	constructor(private readonly httpService: HttpService) {}

	public getImageUrl(): string {
		return this.httpService.apiUrl(`/collector/collector-image`);
	}

	public getConfig(): NewCollectorConfig {
		return this.config;
	}

	public createCollector(data: CollectorCreateRequest): Observable<CollectorCreateResponse> {
		return this.httpService.post<CollectorCreateRequest, CollectorCreateResponse>("/collector/create", data);
	}

	public setCollectorImage(collectorId: Id, image: File): Observable<void> {
		return this.httpService.putFile<void>(`/collector/${collectorId}/collector-image`, image);
	}
}
