import { NavigationMenuItem, NavigationLinkItem } from "../navigation-items";
import { SidebarComponent } from "../sidebar.component";

export function CollectorSidebarComponent(){
    const gameNavbar: NavigationMenuItem[] = [
        new NavigationLinkItem("List", "/collectors"),
    ];

    return (
        <SidebarComponent
            menuItems={gameNavbar}
        />
    )
}
