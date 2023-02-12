import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[popupHost]'
})
export class PopupDirective {
	constructor(public viewContainerRef: ViewContainerRef){}
}
