import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, timer, forkJoin, tap, of as observableof} from 'rxjs';

import * as moment from 'moment';

import { PackTimeResponse } from './types';
import { CollectorOpenService } from './collector-open.service';

import type { Id } from '../../../../types';

const UPDATE_FREQUENCY_MS = 100;

@Component({
	selector: "cc-collector-open",
	templateUrl: "./collector-open.component.html",
	styleUrls: [ "./collector-open.component.scss" ]
})
export class CollectorOpenComponent implements OnInit, OnDestroy {

	@Input()
	public collectorId: Id | undefined = undefined;

	@Input()
	public radius: number = 46;

	public progress: number = 1;

	private maxTime: moment.Duration | undefined = undefined;
	private packTime: Date | undefined = undefined;

	private timerSubscription: Subscription | undefined = undefined;

	constructor(
		private readonly collectorOpenService: CollectorOpenService
	){ }

	public ngOnInit(){
		this.refreshTime().subscribe(() => {
			this.startCounter();
		});
	}

	public ngOnDestroy(){
		this.stopCounter();
	}

	public get strokeDashes(): number{
		return this.radius * 2 * Math.PI
	}

	public get strokeOffset(): number{
		return this.strokeDashes - this.progress * this.strokeDashes;
	}

	public onClick(){
		if(this.collectorId == null) return;
		if(this.progress < 1.0) return;
		this.collectorOpenService.openPack(this.collectorId).subscribe((res) => {
			this.progress = 0;
			this.refreshTime().subscribe(() => {
				this.startCounter();
			});
		});
	}

	private refreshTime(): Observable<unknown>{
		if(this.collectorId == null) return observableof(null);
	
		let streams = [];
		streams.push(this.collectorOpenService.getMaxTime(this.collectorId).pipe(
			tap(res => {
				this.maxTime = moment.duration(res.packTimeMax);
			})
		));

		streams.push(this.collectorOpenService.getTime(this.collectorId).pipe(
			tap((res: PackTimeResponse) => {
				this.packTime = moment(res.packTime).toDate();
			})
		));

		return forkJoin(streams).pipe(
			tap(_ => {
				this.updateProgress();
			})
		);
	}

	private updateProgress(){
		if(this.packTime == null || this.maxTime == null){
			this.progress = 0;
			return;
		}
		let diff: number = (this.packTime.getTime() - Date.now());
		this.progress =  Math.min(1.0, 1.0 - diff / this.maxTime.as("milliseconds"));
	}

	private startCounter(){
		this.timerSubscription = timer(0, UPDATE_FREQUENCY_MS).subscribe(() => {
			this.updateProgress();
			if(this.progress >= 1.0) this.stopCounter();
		});
	}

	private stopCounter(){
		if(this.timerSubscription == null) return;
		this.timerSubscription.unsubscribe();
		this.timerSubscription = undefined;
	}

	public get displayText(): string{
		if(this.progress >= 1.0) return "Open";

		let now = moment(Date.now());
		let end = moment(this.packTime);
		let ms = end.diff(now);

		let seconds = Math.floor(ms / 1000);
		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		let text = "";
		if(minutes < 10){
			text += "0";
		}
		text += minutes;

		text += ":";

		if(seconds < 10){
			text += "0";
		}
		text += seconds;
		return text;
	}
}
