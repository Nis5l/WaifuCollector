import NavigationMenuItem, { NavigationLinkItem, NavigationSubMenuItem } from "../../../shared/NavigationItem";
import Sidebar from "../Sidebar";

function GameSidebar(){
    const gameNavbar: NavigationMenuItem[] = [
        new NavigationSubMenuItem("Dashboard", [
          new NavigationLinkItem("Home", "dashboard"),
          new NavigationLinkItem("Pack", "pack"),
          new NavigationLinkItem("Inventory", "inventory")
        ], <i className="fas fa-home"></i>)
    ];

    return (
        <Sidebar 
            menuItems={gameNavbar}
        />
    )
}

export default GameSidebar;