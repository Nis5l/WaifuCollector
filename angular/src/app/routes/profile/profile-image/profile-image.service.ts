import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Id } from '../../../types';
import { HttpService } from '../../../http-service';

@Injectable()
export class ProfileImageService {
	constructor(private readonly httpService: HttpService) {}

	public getImageUrl(id: Id): string {
		return this.httpService.apiUrl(`/user/${id}/profile-image`);
	}

	public uploadImage(image: File): Observable<void> {
		return this.httpService.putFile("/user/profile-image", image);
	}
}
