import { Component, Input } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { CollectorImageService } from './collector-image.service';
import type { Id } from '../../../../types';

@Component({
	selector: "cc-collector-image",
	templateUrl: "./collector-image.component.html",
	styleUrls: [ "./collector-image.component.scss" ]
})
export class CollectorImageComponent {
	private _collectorId: Id | null = null;
	private readonly collectorImageSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
	public readonly collectorImage$: Observable<string>;

	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
		this.collectorImageSubject.next(this.collectorImageService.getImageUrl(id));
	}
	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	@Input()
	public editable: boolean = false;

	constructor(private readonly collectorImageService: CollectorImageService) {
		this.collectorImage$ = this.collectorImageSubject.asObservable();
	}

	public uploadImage(target: EventTarget | null) {
		if(target == null || !(target instanceof HTMLInputElement)) throw new Error("target has to be input");

		const file = target.files?.item(0);
		if(file == null) throw new Error("no file");

		//TODO: first create collector, then set this image, probably pass this via eventemitter to editor and post from there
	}
}
