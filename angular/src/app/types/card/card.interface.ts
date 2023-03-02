import type { Id } from '../';
import type { CardInfo } from './card-info.interface';
import type { CardFrame } from './card-frame.interface';
import type { CardType } from './card-type.interface';
import type { CardEffect } from './card-effect.interface';

export interface Card {
    id: Id,
    userId: Id,
    level: number,
    quality: number,

    cardInfo: CardInfo,
    cardFrame: CardFrame,
    cardType: CardType,
    cardEffect: CardEffect
}
