import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, filter, map } from 'rxjs';

import { CollectorImageService } from './collector-image.service';
import type { CollectorImage } from './types';
import { AuthService } from '../../../auth-service';

@Component({
	selector: "cc-collector-image",
	templateUrl: "./collector-image.component.html",
	styleUrls: [ "./collector-image.component.scss" ]
})
export class CollectorImageComponent {
	private readonly collectorImageSubject: BehaviorSubject<CollectorImage | null> = new BehaviorSubject<CollectorImage | null>(null);
	public readonly collectorImage$: Observable<string>;
	public readonly editable$: Observable<boolean>;

	@Input()
	public set collectorId(collectorImage: CollectorImage) {
		this.collectorImageSubject.next(collectorImage);
	}
	public get collectorId(): CollectorImage {
		const collectorImage = this.collectorImageSubject.getValue();
		if(collectorImage == null) throw new Error("collectorImage not set");
		return collectorImage;
	}

	@Input()
	public editable: boolean = false;

	constructor(private readonly collectorImageService: CollectorImageService, private readonly authService: AuthService) {
		this.collectorImage$ = this.collectorImageSubject.asObservable().pipe(
			filter((collectorImage): collectorImage is CollectorImage => collectorImage != null),
			map(collectorImage => this.collectorImageService.getImageUrl(collectorImage.id))
		);

		this.editable$ = this.collectorImageSubject.
	}
}
