import { Injectable } from '@angular/core';

import { HttpService } from '../../../../shared/services';
import type { Id } from '../../../../shared/types';

@Injectable()
export class CollectorImageService {
	constructor(private readonly httpService: HttpService) {}

	public getImageUrl(id: Id): string {
		return this.httpService.apiUrl(`/collector/${id}/collector-image`);
	}
}
