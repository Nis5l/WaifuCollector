import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, map } from 'rxjs';

import { CollectorFavoritesService } from './collector-favorites.service';
import { LoadingService } from '../../../../shared/services';
import type { Collector, Id } from '../../../../shared/types';

@Component({
  selector: "cc-collector-favorites",
  templateUrl: "./collector-favorites.component.html",
  styleUrls: [ "./collector-favorites.component.scss" ],
})
export class CollectorFavoritesComponent {
	public readonly favoriteCollectors$: Observable<Collector[]>;
  public readonly userId$: Observable<Id>;

  constructor(
    private readonly collectorFavoritesService: CollectorFavoritesService,
    activatedRoute: ActivatedRoute,
    loadingService: LoadingService,
  ) {
    const observe = activatedRoute.parent == null ? activatedRoute.params : activatedRoute.parent.params;
    this.userId$ = observe.pipe(
      map(params => {
        const userId: unknown = params["userId"];
        if(typeof userId !== "string") throw new Error("userId param not set");
        return userId;
      }),
    );

    this.favoriteCollectors$ = loadingService.waitFor(this.userId$.pipe(
      switchMap(userId => this.collectorFavoritesService.favoriteCollectors(userId))
    ));
  }

}
