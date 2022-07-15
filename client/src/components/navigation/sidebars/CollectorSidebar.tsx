import NavigationMenuItem, { NavigationLinkItem } from "../../../shared/NavigationItem";
import Sidebar from "../Sidebar";

function CollectorSidebar(){
    const gameNavbar: NavigationMenuItem[] = [
        new NavigationLinkItem("New", "/collector/new"),
        new NavigationLinkItem("List", "/collector/list"),
    ];

    return (
        <Sidebar
            menuItems={gameNavbar}
        />
    )
}

export default CollectorSidebar;