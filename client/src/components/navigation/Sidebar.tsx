import React, { Component, RefObject } from 'react'

import {
    ProSidebar,
    Menu,
    SidebarContent,
} from 'react-pro-sidebar'
import NavigationMenuItem from '../../shared/NavigationItem'

import './Sidebar.scss'
type Props = {
    menuItems: NavigationMenuItem[]
}

class Sidebar extends Component<Props, any> {
    private box: RefObject<any>;

    constructor(props: Props) {
        super(props);
        this.state =
        {
            mobile: false,
            toggled: false,
            notification: false,
            notifications: [],
            rotatingSettings: false,
        };

        window.addEventListener('resize', () => this.handleResize());
        this.box = React.createRef();
    }

    handleResize() {
        let size = window.innerWidth;
        if (size < 576) {
            this.setState({collapsed: false, mobile: true});
        } else if (size < 1200) {
            this.setState({collapsed: true, mobile: false});
        } else {
            this.setState({collapsed: false, mobile: false});
        }
    }

    componentDidMount() {
        this.handleResize();
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    /**
     * Close sidebar if clicked outside
     */
    public handleClickOutside: (any) = (event:any) => {
        if ((this.state.mobile && this.state.toggled) && this.box && !this.box.current.contains(event.target)) {
            this.setState({toggled: false});
        }
    }

    toggleMenu() {
        let toggled = Object.assign({}, this.state.toggled);
        toggled = !this.state.toggled;
        this.setState({toggled});
    }

    render() {
        return (
            <div>
                {(this.state.mobile && !this.state.toggled) && <i className="menu-toggle fas fa-bars" onClick={() => this.toggleMenu()}></i>}

                <ProSidebar
                    collapsed={this.state.collapsed}
                    toggled={this.state.toggled}
                    ref={this.box}
                >

                    <SidebarContent>
                        <Menu iconShape="circle">
                            { this.props.menuItems.map((item: NavigationMenuItem) => item.build()) }
                        </Menu>
                    </SidebarContent>
                </ProSidebar>

            </div>

        )
    }
}

export default Sidebar;