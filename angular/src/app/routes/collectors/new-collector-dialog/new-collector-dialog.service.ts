import { Injectable } from '@angular/core';

import { HttpService } from '../../../http-service';
import type { NewCollectorConfig } from './types';

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
}
