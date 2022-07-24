import { NavigationLinkItem, NavigationSubMenuItem, NavigationMenuItem } from "../navigation-items";
import { SidebarComponent } from "../sidebar.component";

export function GameSidebarComponent(){
    const gameNavbar: NavigationMenuItem[] = [
        new NavigationSubMenuItem("Dashboard", [
          new NavigationLinkItem("Home", "/dashboard"),
          new NavigationLinkItem("Pack", "/pack"),
          new NavigationLinkItem("Inventory", "/inventory"),
          new NavigationLinkItem("Users", "/users")
        ], <i className="fas fa-home"></i>)
    ];

    return (
        <SidebarComponent
            menuItems={gameNavbar}
        />
    )
}
