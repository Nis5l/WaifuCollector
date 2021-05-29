import React from 'react'
import Cookies from 'js-cookie'

import NotificationBell from './NotificationBell'
import Notifications from './Notifications'

import {
    ProSidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
} from 'react-pro-sidebar'

import {Link} from 'react-router-dom'

import './Navbar.scss'

class Navbar extends React.Component {

    constructor(props) {

        super(props);

        this.state =
        {
            notification: false,
            notifications: [],
            rotatingSettings: false
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
    handleClickOutside = (event) => {

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

                <div
                    className="blurbackground notification_wrapper"
                    style={{top: this.state.notification ? 0 : "-100vh"}}
                    onClick={() => {this.setState({notification: false})}}
                >
                    <Notifications
                        onHide={() => this.setState({notification: false})}
                        onNotifications={(data) => this.setState({notifications: data})}
                    />
                </div>

                {(this.state.mobile && !this.state.toggled) && <i className="menu-toggle fas fa-bars" onClick={() => this.toggleMenu()}></i>}

                <ProSidebar

                    collapsed={this.state.collapsed}
                    toggled={this.state.toggled}
                    ref={this.box}

                >

                    <SidebarHeader>
                        <Link
                            to="/"
                        >
                            <div
                                className="sidebar-title"
                            >
                                <img
                                    src="/assets/IconWhite.png"
                                    className="headerIcon"
                                    alt="Icon"
                                />

                                <span>WaifuCollector</span>

                            </div>
                        </Link>
                    </SidebarHeader>

                    <SidebarContent>
                        <Menu iconShape="circle">

                            {!this.props.token &&

                                <MenuItem
                                    icon={<i className="fas fa-sign-in-alt"></i>}
                                >
                                    <Link
                                        to="/login"
                                    >
                                        Login
                                    </Link>

                                </MenuItem>

                            }

                            {!this.props.token &&

                                <MenuItem
                                    icon={<i className="fas fa-registered"></i>}
                                >
                                    <Link
                                        to="/register"
                                    >
                                        Register
                                    </Link>

                                </MenuItem>

                            }

                            <MenuItem
                                icon=
                                {
                                    <NotificationBell notifications={this.state.notifications.length} />
                                }
                            >
                                <Link
                                    to="#"
                                    onClick={() => {this.setState({notification: true})}}
                                >
                                    Notifications
                                </Link>
                            </MenuItem>

                            {this.props.token && <SubMenu
                                title="Dashboard"
                                icon={<i className="fas fa-home"></i>}
                            >
                                <MenuItem>
                                    <Link
                                        to="/dashboard"
                                    >
                                        Home
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/pack"
                                    >
                                        Pack
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/inventory"
                                    >
                                        Inventory
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/users"
                                    >
                                        Users
                                    </Link>
                                </MenuItem>
                            </SubMenu>}

                            {this.props.token && Cookies.get("rank") == 1 && <SubMenu
                                title="Adminpanel"
                                icon={<i className="fas fa-user"></i>}
                            >
                                <MenuItem>
                                    <Link
                                        to="/admin/log"
                                    >
                                        Log
                                    </Link>
                                </MenuItem>
                                <MenuItem>Cards</MenuItem>
                                <MenuItem>Anime</MenuItem>
                                <MenuItem>Users</MenuItem>
                            </SubMenu>}

                            <MenuItem
                                icon={<i className="fas fa-clipboard-list"></i>}
                            >
                                <Link
                                    to="/leaderboard"
                                >
                                    Leaderboard
                                </Link>
                            </MenuItem>

                            {this.props.token && <MenuItem
                                icon={<i className="fas fa-sign-out-alt"></i>}
                            >
                                <Link
                                    to="/logout"
                                >
                                    Logout
                                </Link>
                            </MenuItem>}

                        </Menu>
                    </SidebarContent>

                    <SidebarFooter style={{textAlign: 'center'}}>
                        <div
                            className="sidebar-btn-wrapper"
                            style={{
                                padding: '20px 10px',
                            }}
                        >
                            <a
                                href="/settings"
                                className="sidebar-btn"
                                rel="noopener noreferrer"
                            >
                                <div
                                    className="sidebar-btn"
                                    onMouseEnter={() => {
                                        this.setState({rotatingSettings: true});
                                    }}
                                    onMouseLeave={() => {
                                        this.setState({rotatingSettings: false});
                                    }}
                                >
                                    <i
                                        className={"fas fa-cog" + (this.state.rotatingSettings ? " spinning" : "")}
                                    />
                                    <span>Settings</span>
                                </div>
                            </a>
                        </div>
                    </SidebarFooter>

                </ProSidebar>

            </div>

        )
    }
}

export default Navbar
