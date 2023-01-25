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
		this.loadingSubject.next(b);
	}

	public waitFor<T>(o: Observable<T>): Observable<T> {
		this.loadingSubject.next(true);
		this.observables.add(o);
		return o.pipe(
			tap(() => {
				this.observables.delete(o);
				if(this.observables.size === 0) this.loadingSubject.next(false);
			})
		);
	}
}
