import { Component, Input } from '@angular/core';

import type { NavigationItem } from './types';

@Component({
	selector: "cc-tab-navigation",
	templateUrl: "./tab-navigation.component.html",
	styleUrls: [ "./tab-navigation.component.scss" ]
})
export class TabNavigationComponent{
  @Input()
  public items: NavigationItem[] = [];

  public open: boolean = false;

  public hiddenId: number = 0;

  public toggleOpen(): void{
    this.open = !this.open;
  }

  public onResized(element: any){
    const availableWidth = element.offsetWidth;
    const children = element.children;
    this.hiddenId = this.items.length;
    for(let i = 0; i < children.length; i++){
      const child = children[i];
      if(availableWidth < (child.offsetLeft + child.offsetWidth)){
        this.hiddenId = i;
        break;
      }
    }
  }

  public getLink(item: NavigationItem): string {
    return typeof item.link === 'string' ? item.link : item.link();
  }
}