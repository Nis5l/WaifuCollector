import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Id } from '../../../../shared/types';
import { HttpService } from '../../../../shared/services';

@Injectable()
export class ProfileImageService {
	constructor(private readonly httpService: HttpService) {}

	public getImageUrl(id: Id): string {
		return this.httpService.apiUrl(`/user/${id}/profile-image`);
	}

	public uploadImage(image: File): Observable<void> {
		return this.httpService.putFile<void>("/user/profile-image", image);
	}
}
