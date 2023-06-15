import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../shared/services';
import type { Id, InventoryResponse } from '../../../../shared/types';
import { SortType } from './types';

@Injectable()
export class CollectorInventoryService {
  constructor(private readonly httpService: HttpService) {}

  public getInventory(userId: Id, collectorId: Id, page: number, search: string, sortType: SortType): Observable<InventoryResponse> {
    return this.httpService.post(`/user/${userId}/${collectorId}/inventory`, { page, search, sortType });
  }
}
