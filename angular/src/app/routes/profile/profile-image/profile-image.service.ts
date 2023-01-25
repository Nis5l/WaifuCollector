import { Injectable } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';

import type { Id } from '../../../types';

@Injectable()
export class ProfileImageService {
	public getImageUrl(id: Id): Observable<string> {
		return observableOf("/assets/clown.jpg");
	}
}
