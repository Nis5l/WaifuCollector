import React, { Component, RefObject } from 'react'

import NotificationBell from '../NotificationBell'
import Notifications from '../Notifications'

import {
    ProSidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarFooter,
    SidebarContent,
} from 'react-pro-sidebar'

import {Link} from 'react-router-dom'

import './Sidebar.scss'
import { AuthProps, withAuth } from '../../hooks/useAuth'

type Props = AuthProps & {
    token: string | undefined
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

            loggedIn: props.auth != null,
            role: props.auth != null ? props.auth.role : 0
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

    componentDidUpdate(prevProps: Props){
        if(prevProps.auth !== this.props.auth){
            this.setState({
                loggedIn: this.props.auth != null
            });
        }
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
                        onNotifications={(data: any) => this.setState({notifications: data})}
                    />
                </div>

                {(this.state.mobile && !this.state.toggled) && <i className="menu-toggle fas fa-bars" onClick={() => this.toggleMenu()}></i>}

                <ProSidebar
                    collapsed={this.state.collapsed}
                    toggled={this.state.toggled}
                    ref={this.box}
                >

                    <SidebarContent>
                        <Menu iconShape="circle">
                            {!this.state.loggedIn &&
                                <MenuItem
                                    icon={<i className="fas fa-sign-in-alt"></i>}
                                >
                                    <Link
                                        to="/login"
                                        onClick={ () => {this.toggleMenu(); }}
                                    >
                                        Login
                                    </Link>
                                </MenuItem>
                            }

                            {!this.state.loggedIn &&
                                <MenuItem
                                    icon={<i className="fas fa-registered"></i>}
                                >
                                    <Link
                                        to="/register"
                                        onClick={ () => {this.toggleMenu(); }}
                                    >
                                        Register
                                    </Link>
                                </MenuItem>

                            }

                            {this.state.loggedIn && <MenuItem
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
                            </MenuItem>}

                            {this.state.loggedIn && <SubMenu
                                title="Dashboard"
                                icon={<i className="fas fa-home"></i>}
                            >
                                <MenuItem>
                                    <Link
                                        to="/dashboard"
                                        onClick={ () => {this.toggleMenu(); }}
                                    >
                                        Home
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/pack"
                                        onClick={ () => {this.toggleMenu(); }}
                                    >
                                        Pack
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/inventory"
                                        onClick={ () => {this.toggleMenu(); }}
                                    >
                                        Inventory
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/users"
                                        onClick={ () => {this.toggleMenu(); }}
                                    >
                                        Users
                                    </Link>
                                </MenuItem>
                            </SubMenu>}

                            {this.state.loggedIn && this.state.role === 1 && <SubMenu
                                title="Adminpanel"
                                icon={<i className="fas fa-user"></i>}
                            >
                                <MenuItem>
                                    <Link
                                        to="/admin/log"
                                        onClick={ () => {this.toggleMenu(); }}
                                    >
                                        Log
                                    </Link>
                                </MenuItem>
                                <MenuItem>Cards</MenuItem>
                                <MenuItem>Anime</MenuItem>
                                <MenuItem>Users</MenuItem>
                            </SubMenu>}

                            {false && <MenuItem
                                icon={<i className="fas fa-clipboard-list"></i>}
                            >
                                <Link
                                    to="/leaderboard"
                                    onClick={ () => {this.toggleMenu(); }}
                                >
                                    Leaderboard
                                </Link>
                            </MenuItem>}

                            {this.state.loggedIn && <MenuItem
                                icon={<i className="fas fa-sign-out-alt"></i>}
                            >
                                <Link
                                    to="/logout"
                                    onClick={ () => {this.toggleMenu(); }}
                                >
                                    Logout
                                </Link>
                            </MenuItem>}

                        </Menu>
                    </SidebarContent>

                    {this.state.loggedIn && <SidebarFooter style={{textAlign: 'center'}}>
                        <div
                            className="sidebar-btn-wrapper"
                            style={{
                                padding: '20px 10px',
                            }}
                        >
                            <Link
                                to="/settings"
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
                            </Link>
                        </div>
                    </SidebarFooter>}

                </ProSidebar>

            </div>

        )
    }
}

export default withAuth(Sidebar);
