import type { Collector } from '../collector';

export interface CollectorsIndexResponse {
    pageSize: number,
    page: number,
    collectorCount: number,
    collectors: Collector[],
}
