import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, filter, map, combineLatest as observableCombineLatest } from 'rxjs';

import { CollectorImageService } from './collector-image.service';
import type { CollectorImage } from './types';
import { AuthService } from '../../../../shared/services';

@Component({
	selector: "cc-collector-image",
	templateUrl: "./collector-image.component.html",
	styleUrls: [ "./collector-image.component.scss" ]
})
export class CollectorImageComponent {
	private readonly collectorImageSubject: BehaviorSubject<CollectorImage | null> = new BehaviorSubject<CollectorImage | null>(null);
	public readonly collectorImage$: Observable<string>;
	public readonly editableSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly editable$: Observable<boolean>;

	@Input()
	public set collector(collectorImage: CollectorImage) {
		this.collectorImageSubject.next(collectorImage);
	}
	public get collector(): CollectorImage {
		const collectorImage = this.collectorImageSubject.getValue();
		if(collectorImage == null) throw new Error("collectorImage not set");
		return collectorImage;
	}

	@Input()
	public set editable(b: boolean) {
		this.editableSubject.next(b);
	}

	public get editable(): boolean {
		return this.editableSubject.getValue();
	}

	constructor(private readonly collectorImageService: CollectorImageService, private readonly authService: AuthService) {
		const collectorImageNonNull$ = this.collectorImageSubject.asObservable().pipe(
			filter((collectorImage): collectorImage is CollectorImage => collectorImage != null),
		);
		this.collectorImage$ = collectorImageNonNull$.pipe(
			map(collectorImage => this.collectorImageService.getImageUrl(collectorImage.id))
		);

		this.editable$ = observableCombineLatest([this.editableSubject.asObservable(), collectorImageNonNull$]).pipe(
			map(([editable, collectorImage]) => editable === true && this.authService.getUserId() === collectorImage.userId.toLowerCase())
		);
	}
}
