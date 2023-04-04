import { Component } from '@angular/core';

import type { CardData, CardInfo, CardFrame, CardType, CardEffect } from '../../shared/types/card';

@Component({
	selector: 'gc-home',
	templateUrl: './home.component.html',
	styleUrls: [ './home.component.scss' ],
})
export class HomeComponent {
	public cardData: CardData;

	constructor(){
		let cardInfo: CardInfo = { id: "asd", name: "Doggo?", image: "http://localhost:8080/card_image/card_default.jpg" };
		let cardFrame: CardFrame = { id: 1, name: "silver", front: "http://localhost:8080/frame/Frame_Silver_Front.png", back: "http://localhost:8080/frame/Frame_Silver_Back.png" };
		let cardType: CardType = { id: "asdss", name: "Doggies", userId: null };
		let cardEffect: CardEffect = { id: 1, image: "http://localhost:8080/effect/Effect2.gif", opacity: 0.5 };
		this.cardData = { cardInfo, cardFrame, cardType, cardEffect };
	}
}
