import { Component, Input } from '@angular/core';
import { Observable, BehaviorSubject, tap, filter, share } from 'rxjs';

import { SubscriptionManagerComponent } from '../../abstract';

@Component({
	selector: 'cc-loading',
	templateUrl: './loading.component.html',
	styleUrls: [ './loading.component.scss' ],
})
export class LoadingComponent<T> extends SubscriptionManagerComponent {
	private readonly observableSubject: BehaviorSubject<Observable<T> | null> = new BehaviorSubject<Observable<T> | null>(null);
	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly loading$: Observable<boolean>;
	@Input()
	public set observable(o: Observable<T>) {
		this.observableSubject.next(o);
	}
	public get observable(): Observable<T> {
		const o = this.observableSubject.getValue();
		if(o == null) throw new Error("observable not set");
		return o;
	}

	public constructor() {
		super();
		this.loading$ = this.loadingSubject.asObservable();

		this.observableSubject.pipe(
			filter((obs): obs is Observable<T> => obs != null)
		).subscribe(obs => {
			this.waitFor(obs);
		});
	}

	//NOTE: this observable should be shared!!
	public waitFor(o: Observable<T>): void {
		const f = () => {
			this.loadingSubject.next(false);
		};
		o.pipe(tap({
			next: () => f(),
			error: () => f(),
			subscribe:() => {
				this.loadingSubject.next(true);
			},
			finalize: () => undefined,
			complete: () => undefined
		})).subscribe();
	}
}
