import type { CardInfo } from './card-info.interface';
import type { CardType } from './card-type.interface';

export interface Card {
	cardInfo: CardInfo,
	cardType: CardType,
}
