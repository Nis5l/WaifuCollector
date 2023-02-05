import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { HttpService } from '../../../http-service';
import { Id } from '../../../types';
import type { CreateConfigCollectorResponse, NewCollectorConfig, CollectorCreateResponse, CollectorCreateRequest } from './types';

@Injectable()
export class NewCollectorDialogService {
	private config: NewCollectorConfig = {
		name: {
			minLength: 0,
			maxLength: 0
		}
	};

	private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private readonly httpService: HttpService) {
		// Load config from server
		this.loadingSubject.next(true);
		this.httpService.get<CreateConfigCollectorResponse>("/collector/create-config").subscribe((res: CreateConfigCollectorResponse) => {
			this.config.name.minLength = res.min_length;
			this.config.name.maxLength = res.max_length;
			this.loadingSubject.next(false);
		});
	}

	public loading(): Observable<boolean>{
		return this.loadingSubject.asObservable();
	}

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
