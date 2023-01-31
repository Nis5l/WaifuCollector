import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, ReplaySubject } from 'rxjs';

@Component({
	selector: "cc-image-circle",
	templateUrl: "./image-circle.component.html",
	styleUrls: [ "./image-circle.component.scss" ],
})
export class ImageCircleComponent {
	private readonly imageSubject: ReplaySubject<string | SafeResourceUrl> = new ReplaySubject<string | SafeResourceUrl>(1);
	public readonly image$: Observable<string | SafeResourceUrl>;

	@Output()
	public readonly onImageChange: EventEmitter<File> = new EventEmitter<File>();

	@Input()
	public set image(path: string | null) {
		if(path == null) return;
		this.imageSubject.next(path);
	}

	@Input()
	public editable: boolean = false;

	constructor(private readonly domSanitizer: DomSanitizer) {
		this.image$ = this.imageSubject.asObservable();
	}

	public imageChange(target: EventTarget | null) {
		if(target == null || !(target instanceof HTMLInputElement)) throw new Error("target has to be input");

		const file = target.files?.item(0);
		if(file == null) throw new Error("no file");

		this.onImageChange.next(file);
		const blobUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
		this.imageSubject.next(blobUrl);
	}
}
