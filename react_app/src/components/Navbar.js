import React, { Component } from 'react'

import {
    ProSidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
} from 'react-pro-sidebar';

import {Link} from 'react-router-dom';

import './Navbar.scss'

export class Navbar extends Component {

    constructor(props){

        super(props);

        this.state = {

            collapsed: false,
            toggled: false

        };

    }

    render() {

        return (

            <ProSidebar
            
                collapsed={this.state.collapsed}
                toggled={this.state.toggled}
            
            >
                <SidebarHeader>
                    <Link
                            to="/"
                    >
                        <div
                            className="sidebar-title"
                        >
                                <i className="headerIcon fas fa-home"></i>
                                WaifuCollector
                            
                        </div>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <Menu iconShape="circle">
                        <MenuItem
                            icon={<i className="fas fa-clipboard-list"></i>}
                        >
                            <Link
                                to="/leaderboard"
                            >
                                Leaderboard
                            </Link>
                        </MenuItem>
                        <SubMenu
                            title="Dashboard"
                            icon={<i className="fas fa-home"></i>}
                        >
                            <MenuItem>
                                <Link
                                    to="/dashboard"
                                >
                                    Menu
                                </Link>
                            </MenuItem>
                            <MenuItem>Pack</MenuItem>
                            <MenuItem>Inventory</MenuItem>
                            <MenuItem>Friends</MenuItem>
                        </SubMenu>
                        <SubMenu
                            title="Adminpanel"
                            icon={<i className="fas fa-user"></i>}
                        >
                            <MenuItem>Stats</MenuItem>
                            <MenuItem>Cards</MenuItem>
                            <MenuItem>Anime</MenuItem>
                            <MenuItem>Users</MenuItem>
                        </SubMenu>
                    </Menu>
                </SidebarContent>

                <SidebarFooter style={{ textAlign: 'center' }}>
                    <div
                        className="sidebar-btn-wrapper"
                        style={{
                            padding: '20px 24px',
                        }}
                    >
                    <a
                        href="https://github.com/azouaoui-med/react-pro-sidebar"
                        target="_blank"
                        className="sidebar-btn"
                        rel="noopener noreferrer"
                    >
                        <span>Settings</span>
                    </a>
                    </div>
                </SidebarFooter>

            </ProSidebar>

        )
    }
}

export default Navbar
