import { Injectable } from '@angular/core';

import { HttpService } from '../../../http-service';
import type { Id } from '../../../types';

@Injectable()
export class CollectorBannerService {
	constructor(private readonly httpService: HttpService) {}

	public getBannerUrl(collectorId: Id): string {
		return this.httpService.apiUrl(`/collector/${collectorId}/banner`);
	}
}
