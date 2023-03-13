import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import type { CardData } from './types';

@Component({
	selector: 'cc-basic-card',
	templateUrl: './basic-card.component.html',
	styleUrls: [ './basic-card.component.scss' ],
})
export class BasicCardComponent {
	@Input()
	public card: CardData | undefined = undefined;

	public get frameFront(): string{
		return "http://localhost:8080/frame/Frame_Silver_Front.png";
	}

	public get frameBack(): string{
		return "http://localhost:8080/frame/Frame_Silver_Back.png";
	}

	public get image(): string{
		return "http://localhost:8080/card_image/card_default.jpg";
	}

	public get effect(): string{
		return "http://localhost:8080/effect/Effect2.gif";
	}

	public get name(): string{
		return "Doggo";
	}

	public get type(): string{
		return "Doggies?!";
	}
}
