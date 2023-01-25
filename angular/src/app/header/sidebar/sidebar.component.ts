import { Component, Input } from '@angular/core';

@Component({
  selector: 'cc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent {
	private _open: boolean = false;

	@Input()
	public set open(b: boolean | null | undefined) {
		this._open = b == true;
	}

	public get open(): boolean {
		return this._open;
	}
}
