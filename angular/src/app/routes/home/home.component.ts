import { Component } from '@angular/core';

import type { CardInfo, CardFrame, CardType, CardEffect } from '../../shared/types/card';
import type { CardData } from '../../shared/components/basic-card';

@Component({
	selector: 'gc-home',
	templateUrl: './home.component.html',
	styleUrls: [ './home.component.scss' ],
})
export class HomeComponent {
	public cardData: CardData;

	constructor(){
		let cardInfo: CardInfo = { id: "asd", name: "Doggo?", image: "doggo" };
		let cardFrame: CardFrame = { id: 1, name: "silver", front: "front", back: "back" };
		let cardType: CardType = { id: "asdss", name: "Doggies"};
		let cardEffect: CardEffect = { id: 1, image: "effect1", opacity: 0.5 };
		this.cardData = { cardInfo, cardFrame, cardType, cardEffect };
	}
}
