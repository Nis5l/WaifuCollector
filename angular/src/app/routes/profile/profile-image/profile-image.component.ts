import { Component, Input } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';

import { ProfileImageService } from './profile-image.service';
import { AuthService } from '../../../auth-service';
import { LoadingService } from '../../../loading';
import type { Id } from '../../../types';

import { BaseComponent } from '../../../base-component';

@Component({
	selector: 'cc-profile-image',
	templateUrl: './profile-image.component.html',
	styleUrls: [ './profile-image.component.scss' ],
})
export class ProfileImageComponent extends BaseComponent{
	private _userId: Id | null = null;
	private readonly profileImageSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
	public readonly profileImage$: Observable<string>;

	@Input()
	public set userId(id: Id) {
		this._userId = id;
		this.profileImageSubject.next(this.profileImageService.getImageUrl(id));
	}
	public get userId(): Id {
		if(this._userId == null) throw new Error("userId not set");
		return this._userId;
	}

	@Input()
	public editable: boolean = false;

	constructor(
		public readonly profileImageService: ProfileImageService,
		private readonly authService: AuthService,
		private readonly loadingService: LoadingService,
	) {
		super();
		this.profileImage$ = this.profileImageSubject.asObservable();
	}

	public isEditable(): boolean {
		return this.authService.getUserId() == this.userId && this.editable;
	}

	public uploadImage(file: File) {
		this.registerSubscription(
			this.loadingService.waitFor(this.profileImageService.uploadImage(file)).subscribe(
				() => this.profileImageSubject.next(`${this.profileImageService.getImageUrl(this.userId)}?${new Date().getTime()}`)
			)
		);
	}
}
