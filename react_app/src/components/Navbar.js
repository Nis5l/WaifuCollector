import React, { Component } from 'react'
import ReactDOM from 'react-dom';

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

class Navbar extends React.Component {

    constructor(props){

        super(props);

        this.state = {

            collapsed: false,
            toggled: false

        };

        const handleResize = () => { this.handleResize(); }

        window.addEventListener('resize', handleResize);

    }

    handleResize(){

        let size = window.innerWidth;

        let state = Object.assign({}, this.state);

        if(size < 576){

            state['collapsed'] = false;
            state['toggled'] = true;

        }else if(size < 768){

            state['collapsed'] = true;
            state['toggled'] = false;

        }else{

            state['collapsed'] = false;
            state['toggled'] = false;

        }

        this.setState(state);

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
                                <img 
                                    src="/assets/Icon.png"
                                    className="headerIcon"
                                />
                                
                                <span>WaifuCollector</span>
                            
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
                                    Home
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
