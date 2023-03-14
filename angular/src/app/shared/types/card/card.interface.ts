import type { CardData } from './card-data.interface';
import type { Id } from '../id.interface';

export interface Card extends CardData {
    id: Id,
    userId: Id,
    level: number,
    quality: number,
}
