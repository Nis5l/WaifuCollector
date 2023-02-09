import { Injectable } from '@angular/core';

import { HttpService } from '../../../http-service';
import type { Id } from '../../../types';

@Injectable()
export class CollectorImageService {
	constructor(private readonly httpService: HttpService) {}

	public getImageUrl(id: Id): string {
		return this.httpService.apiUrl(`/collector/${id}/collector-image`);
	}
}
