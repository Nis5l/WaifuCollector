import { ReactNode } from "react";
import { MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "react-router-dom";

interface NavigationMenuItem {
    text: string,
    icon?: ReactNode,
    build: () => ReactNode
}

class NavigationLinkItem implements NavigationMenuItem {
    private id: string = random_string(20);

    constructor(
        public text: string,
        public link: string,
        public icon?: ReactNode
    ){}

    build(): ReactNode{
        return (
            <MenuItem
                key={this.id}

                icon={this.icon}
            >
                <Link
                    to={this.link}
                >{this.text}</Link>
            </MenuItem>
        )
    }
}

class NavigationSubMenuItem implements NavigationMenuItem {
    private id: string = random_string(20);

    constructor(
        public text: string,
        public items: NavigationMenuItem[],
        public icon?: ReactNode
    ){}

    build(): ReactNode{
        const items: ReactNode[] = this.items.map((item: NavigationMenuItem) => item.build() );

        return (
            <SubMenu
                key={this.id}

                title={this.text}
                icon={this.icon}
            >
                { items }
            </SubMenu>
        )
    }
}

function random_string(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default NavigationMenuItem;
export { NavigationLinkItem, NavigationSubMenuItem };