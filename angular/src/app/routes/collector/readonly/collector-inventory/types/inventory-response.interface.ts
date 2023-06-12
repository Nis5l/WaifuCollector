import type { UnlockedCard } from '../../../../../shared/types';

export interface InventoryResponse {
    pageSize: number,
    page: number,
    cardCount: number,
    cards: UnlockedCard[],
}
