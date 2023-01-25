import { Component, Input } from '@angular/core';

import { ProfileImageService } from './profile-image.service';
import type { Id } from '../../../types';

@Component({
	selector: 'cc-profile-image',
	templateUrl: './profile-image.component.html',
	styleUrls: [ './profile-image.component.scss' ],
})
export class ProfileImageComponent {
	private _userId: Id | null = null;

	@Input()
	public set userId(id: Id) {
		this._userId = id;
	}
	public get userId(): Id {
		if(this._userId == null) throw new Error("userId not set");
		return this._userId;
	}

	constructor(public readonly profileImageService: ProfileImageService) {}
}
