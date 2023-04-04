import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable()
export class LoadingService {
	private readonly observables: Set<Observable<unknown>> = new Set<Observable<unknown>>();

	private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public readonly loading$: Observable<boolean>;

	constructor() {
		this.loading$ = this.loadingSubject.asObservable();
	}

	public setLoading(b: boolean): void {
		if(b === false && this.observables.size !== 0) return;
		setTimeout(() => {
			this.loadingSubject.next(b);
		});
	}

	public waitFor<T>(o: Observable<T>): Observable<T> {
		const f = () => {
			this.observables.delete(o);
			this.setLoading(false);
		};
		return o.pipe(
			tap({
				next: () => f(),
				error: () => f(),
				subscribe:() => {
					this.setLoading(true);
					this.observables.add(o);
				},
				finalize: () => console.log("finalize"),
				complete: () => console.log("complete")
			})
		);
	}
}
