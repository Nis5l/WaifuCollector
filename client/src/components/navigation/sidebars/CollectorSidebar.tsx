import NavigationMenuItem, { NavigationLinkItem } from "../../../shared/NavigationItem";
import Sidebar from "../Sidebar";

function CollectorSidebar(){
    const gameNavbar: NavigationMenuItem[] = [
        new NavigationLinkItem("List", "/collectors"),
    ];

    return (
        <Sidebar
            menuItems={gameNavbar}
        />
    )
}

export default CollectorSidebar;